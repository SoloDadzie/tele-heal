import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import Button from '../components/Button';
import ThemedText from '../components/ThemedText';
import ErrorAlert from '../components/ErrorAlert';
import { theme } from '../theme';
import type { PaymentIntent } from '../types/payments';
import { PAYSTACK_PUBLIC_KEY, toPaystackMinorUnit } from '../config/payments';
import { useAuth } from '../contexts/AuthContext';
import { initializePayment, verifyPayment } from '../services/payments';

type PaymentScreenProps = {
  intent: PaymentIntent;
  onClose: () => void;
  onSuccess: (reference: string) => void;
  onError?: (message?: string) => void;
};

const FALLBACK_EMAIL = 'patient@example.com';

type PaymentStage = 'initializing' | 'awaitingPrompt' | 'processing' | 'completed' | 'error';

type PaymentStep = {
  key: Exclude<PaymentStage, 'error'>;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const PAYMENT_STEPS: PaymentStep[] = [
  {
    key: 'initializing',
    label: 'Secure session',
    description: 'Connecting to Tele Heal payment services',
    icon: 'shield-checkmark-outline',
  },
  {
    key: 'awaitingPrompt',
    label: 'Waiting for approval',
    description: 'Prompt shown to patient for confirmation',
    icon: 'phone-portrait-outline',
  },
  {
    key: 'processing',
    label: 'Processing payment',
    description: 'Paystack verifying payment details',
    icon: 'sync-outline',
  },
  {
    key: 'completed',
    label: 'Receipt sent',
    description: 'We’ll email the receipt and update your visit',
    icon: 'checkmark-circle-outline',
  },
];

const PaymentScreen: React.FC<PaymentScreenProps> = ({ intent, onClose, onSuccess, onError }) => {
  const { user } = useAuth();
  const [stage, setStage] = React.useState<PaymentStage>('initializing');
  const [error, setError] = React.useState<{ title: string; message: string } | null>(null);
  const [paymentReference, setPaymentReference] = React.useState<string | null>(null);

  // Initialize payment on mount
  React.useEffect(() => {
    const initPayment = async () => {
      if (!user?.id) return;

      try {
        const result = await initializePayment({
          appointmentId: intent.appointmentId,
          amount: intent.amountValue,
          email: intent.patientEmail || user.email || FALLBACK_EMAIL,
          fullName: intent.patientName || user.full_name || 'Patient',
        });

        if (!result.success) {
          setError({
            title: 'Payment Initialization Failed',
            message: result.error || 'Failed to initialize payment.',
          });
          setStage('error');
          onError?.(result.error);
          return;
        }

        setPaymentReference(result.data?.reference || null);
        setStage('awaitingPrompt');
      } catch (err: any) {
        setError({
          title: 'Error',
          message: err.message || 'Failed to initialize payment.',
        });
        setStage('error');
        onError?.(err.message);
      }
    };

    initPayment();
  }, [user?.id, intent.appointmentId, intent.amountValue, intent.patientEmail, intent.patientName, onError]);

  // Handle payment verification
  const handlePaymentVerification = async (reference: string) => {
    try {
      setStage('processing');

      const result = await verifyPayment({
        reference,
        appointmentId: intent.appointmentId,
      });

      if (!result.success) {
        setError({
          title: 'Payment Verification Failed',
          message: result.error || 'Failed to verify payment.',
        });
        setStage('error');
        onError?.(result.error);
        return;
      }

      setStage('completed');
      onSuccess(reference);
    } catch (err: any) {
      setError({
        title: 'Error',
        message: err.message || 'Failed to verify payment.',
      });
      setStage('error');
      onError?.(err.message);
    }
  };

  const formattedAmount = React.useMemo(() => {
    try {
      return new Intl.NumberFormat('en-GH', {
        style: 'currency',
        currency: intent.currency ?? 'GHS',
        maximumFractionDigits: 0,
      }).format(intent.amountValue);
    } catch {
      return `${intent.currency ?? 'GHS'} ${intent.amountValue}`;
    }
  }, [intent.amountValue, intent.currency]);

  const checkoutHtml = React.useMemo(() => {
    const sanitizedServiceLabel = intent.serviceLabel.replace(/'/g, "\\'");
    const sanitizedPatientName = (intent.patientName || 'TeleHeal Patient').replace(/'/g, "\\'");
    const email = intent.patientEmail || FALLBACK_EMAIL;
    const currency = intent.currency ?? 'GHS';
    const amountMinor = toPaystackMinorUnit(intent.amountValue);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif, sans-serif; margin: 0; padding: 0; background-color: #f6f8fb; }
            #status { display: flex; align-items: center; justify-content: center; min-height: 100vh; color: #0d9488; font-size: 16px; }
          </style>
        </head>
        <body>
          <div id="status">Connecting to Paystack…</div>
          <script type="text/javascript">
            function postToApp(payload) {
              try {
                window.ReactNativeWebView.postMessage(JSON.stringify(payload));
              } catch (error) {
                console.log('Unable to post message', error);
              }
            }

            function openCheckout() {
              if (!window.PaystackPop) {
                setTimeout(openCheckout, 100);
                return;
              }
              try {
                document.getElementById('status').textContent = 'Launching Paystack checkout…';
                const handler = window.PaystackPop.setup({
                  key: '${PAYSTACK_PUBLIC_KEY}',
                  email: '${email}',
                  amount: ${amountMinor},
                  currency: '${currency}',
                  ref: '${intent.reference}',
                  firstname: '${sanitizedPatientName}',
                  metadata: {
                    custom_fields: [
                      { display_name: 'Service', variable_name: 'service_name', value: '${sanitizedServiceLabel}' }
                    ]
                  },
                  callback: function(response) {
                    postToApp({ status: 'success', reference: response.reference });
                  },
                  onClose: function() {
                    postToApp({ status: 'closed' });
                  }
                });
                handler.openIframe();
              } catch (err) {
                postToApp({ status: 'failed', message: err?.message ?? 'Unable to start Paystack checkout' });
              }
            }

            const script = document.createElement('script');
            script.src = 'https://js.paystack.co/v1/inline.js';
            script.onload = openCheckout;
            script.onerror = function() {
              postToApp({ status: 'failed', message: 'Failed to load Paystack resources' });
            };
            document.body.appendChild(script);
          </script>
        </body>
      </html>
    `;
  }, [intent.amountValue, intent.currency, intent.patientEmail, intent.patientName, intent.reference, intent.serviceLabel]);

  const handleWebViewMessage = React.useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const payload = JSON.parse(event.nativeEvent.data);
        if (payload.status === 'success') {
          setPaymentStage('processing');
          setStatusMessage('Payment confirmed. Finalizing booking…');
          onSuccess(payload.reference);
          setPaymentStage('completed');
          setStatusMessage('Payment successful. Receipt sent to your email.');
        } else if (payload.status === 'closed') {
          setPaymentStage('error');
          setStatusMessage('Checkout was closed before finishing.');
          onClose();
        } else if (payload.status === 'failed') {
          setPaymentStage('error');
          setStatusMessage(payload.message ?? 'Unable to complete payment. Try again.');
          onError?.(payload.message);
        }
      } catch (error) {
        setPaymentStage('error');
        setStatusMessage('Unexpected payment error. Try again.');
        onError?.(error instanceof Error ? error.message : 'Unknown payment error');
      }
    },
    [onClose, onSuccess, onError],
  );

  const isKeyConfigured = PAYSTACK_PUBLIC_KEY && PAYSTACK_PUBLIC_KEY !== 'pk_test_xxxxxxxx';
  const [paymentStage, setPaymentStage] = React.useState<PaymentStage>('initializing');
  const [statusMessage, setStatusMessage] = React.useState('Connecting to Paystack…');
  const mockTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    return () => {
      if (mockTimerRef.current) {
        clearTimeout(mockTimerRef.current);
      }
    };
  }, []);

  const currentStepIndex = React.useMemo(() => {
    const index = PAYMENT_STEPS.findIndex((step) => step.key === paymentStage);
    return index === -1 ? 0 : index;
  }, [paymentStage]);

  const beginMockPaymentFlow = () => {
    setPaymentStage('awaitingPrompt');
    setStatusMessage('Pretending to prompt patient for payment approval…');

    mockTimerRef.current = setTimeout(() => {
      setPaymentStage('processing');
      setStatusMessage('Processing mock payment…');

      mockTimerRef.current = setTimeout(() => {
        setPaymentStage('completed');
        setStatusMessage('Payment marked as paid for demo purposes.');
        onSuccess(`mock-${Date.now()}`);
      }, 1800);
    }, 1600);
  };

  const renderStatusTracker = () => (
    <View style={styles.statusTracker}>
      {PAYMENT_STEPS.map((step, index) => {
        const isActive = paymentStage === step.key;
        const isComplete = index < currentStepIndex;
        return (
          <View key={step.key} style={styles.statusStep}>
            <View
              style={[
                styles.statusIcon,
                (isActive || isComplete) && styles.statusIconActive,
                isComplete && styles.statusIconComplete,
              ]}
            >
              <Ionicons
                name={step.icon}
                size={16}
                color={
                  isActive || isComplete ? theme.colors.neutral.white : theme.colors.text.secondary
                }
              />
            </View>
            <View style={styles.statusCopy}>
              <ThemedText variant="caption1" color={isActive ? 'primary' : 'secondary'}>
                {step.label}
              </ThemedText>
              <ThemedText variant="caption2" color="secondary">
                {step.description}
              </ThemedText>
            </View>
          </View>
        );
      })}
      <View style={styles.statusMessageRow}>
        <Ionicons
          name={
            paymentStage === 'error'
              ? 'alert-circle-outline'
              : paymentStage === 'completed'
                ? 'checkmark-circle-outline'
                : 'information-circle-outline'
          }
          size={16}
          color={
            paymentStage === 'error'
              ? theme.colors.semantic.danger
              : paymentStage === 'completed'
                ? theme.colors.semantic.success
                : theme.colors.text.secondary
          }
        />
        <ThemedText
          variant="caption1"
          color="secondary"
          style={[
            styles.statusMessageText,
            paymentStage === 'error' && styles.statusMessageError,
            paymentStage === 'completed' && styles.statusMessageSuccess,
          ]}
        >
          {statusMessage}
        </ThemedText>
      </View>
    </View>
  );

  React.useEffect(() => {
    if (!isKeyConfigured) return;
    setPaymentStage('initializing');
    setStatusMessage('Launching secure Paystack session…');
    const timer = setTimeout(() => {
      setPaymentStage('awaitingPrompt');
      setStatusMessage('Prompting Paystack checkout for the patient.');
    }, 900);
    return () => {
      clearTimeout(timer);
    };
  }, [isKeyConfigured]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={onClose} activeOpacity={0.85}>
          <Ionicons name="close" size={20} color={theme.colors.primary.main} />
        </TouchableOpacity>
        <ThemedText variant="headline2" color="primary">
          Secure payment
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.summaryCard}>
        <ThemedText variant="caption1" color="secondary">
          Service
        </ThemedText>
        <ThemedText variant="body2" color="primary">
          {intent.serviceLabel}
        </ThemedText>
        <View style={styles.summaryRow}>
          <View>
            <ThemedText variant="caption1" color="secondary">
              Amount due
            </ThemedText>
            <ThemedText variant="headline2" color="primary">
              {formattedAmount}
            </ThemedText>
          </View>
          <View>
            <ThemedText variant="caption1" color="secondary" style={styles.referenceLabel}>
              Reference
            </ThemedText>
            <ThemedText variant="body3" color="primary">
              {intent.reference}
            </ThemedText>
          </View>
        </View>
      </View>

      {renderStatusTracker()}

      {!isKeyConfigured ? (
        <View style={styles.placeholderCard}>
          <Ionicons name="alert-circle-outline" size={28} color={theme.colors.semantic.warning} />
          <ThemedText variant="headline3" color="primary">
            Demo mode active
          </ThemedText>
          <ThemedText variant="body3" color="secondary" style={styles.placeholderCopy}>
            Add your Paystack publishable key to EXPO_PUBLIC_PAYSTACK_KEY and restart the app to process real payments.
            Until then, you can simulate a successful payment for design reviews.
          </ThemedText>
          <View style={styles.placeholderButtons}>
            <Button label="Close" variant="secondary" fullWidth onPress={onClose} />
            <View style={styles.placeholderSpacer} />
            <Button
              label="Simulate payment"
              variant="primary"
              fullWidth
              onPress={beginMockPaymentFlow}
              disabled={paymentStage === 'processing'}
            />
          </View>
        </View>
      ) : (
        <View style={styles.webviewShell}>
          <WebView
            originWhitelist={['*']}
            source={{ html: checkoutHtml }}
            onMessage={handleWebViewMessage}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loadingState}>
                <ActivityIndicator size="large" color={theme.colors.primary.main} />
                <ThemedText variant="body3" color="secondary">
                  Connecting to Paystack…
                </ThemedText>
              </View>
            )}
            style={styles.webview}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.muted,
  },
  statusTracker: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    ...theme.shadows.md,
  },
  statusStep: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'flex-start',
  },
  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.muted,
  },
  statusIconActive: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  statusIconComplete: {
    backgroundColor: theme.colors.semantic.success,
    borderColor: theme.colors.semantic.success,
  },
  statusCopy: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  statusMessageRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border.light,
    paddingTop: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  statusMessageText: {
    flex: 1,
  },
  statusMessageError: {
    color: theme.colors.semantic.danger,
  },
  statusMessageSuccess: {
    color: theme.colors.semantic.success,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  headerSpacer: {
    width: 40,
  },
  summaryCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
    ...theme.shadows.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  referenceLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  placeholderCard: {
    flex: 1,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    ...theme.shadows.md,
  },
  placeholderCopy: {
    textAlign: 'center',
  },
  placeholderButtons: {
    width: '100%',
  },
  placeholderSpacer: {
    height: theme.spacing.sm,
  },
  webviewShell: {
    flex: 1,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.xxl,
    overflow: 'hidden',
    backgroundColor: theme.colors.background.card,
    ...theme.shadows.md,
  },
  webview: {
    flex: 1,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.background.card,
  },
});

export default PaymentScreen;
