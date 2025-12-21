import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import Button from '../components/Button';
import ThemedText from '../components/ThemedText';
import { theme } from '../theme';
import type { PaymentIntent } from '../types/payments';
import { PAYSTACK_PUBLIC_KEY, toPaystackMinorUnit } from '../config/payments';

type PaymentScreenProps = {
  intent: PaymentIntent;
  onClose: () => void;
  onSuccess: (reference: string) => void;
  onError?: (message?: string) => void;
};

const FALLBACK_EMAIL = 'patient@example.com';

const PaymentScreen: React.FC<PaymentScreenProps> = ({ intent, onClose, onSuccess, onError }) => {
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
          onSuccess(payload.reference);
        } else if (payload.status === 'closed') {
          onClose();
        } else if (payload.status === 'failed') {
          onError?.(payload.message);
        }
      } catch (error) {
        onError?.(error instanceof Error ? error.message : 'Unknown payment error');
      }
    },
    [onClose, onSuccess, onError],
  );

  const isKeyConfigured = PAYSTACK_PUBLIC_KEY && PAYSTACK_PUBLIC_KEY !== 'pk_test_xxxxxxxx';

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

      {!isKeyConfigured ? (
        <View style={styles.placeholderCard}>
          <Ionicons name="alert-circle-outline" size={28} color={theme.colors.semantic.warning} />
          <ThemedText variant="headline3" color="primary">
            Configure Paystack key
          </ThemedText>
          <ThemedText variant="body3" color="secondary" style={styles.placeholderCopy}>
            Add your Paystack publishable key to EXPO_PUBLIC_PAYSTACK_KEY and restart the app to enable payments.
          </ThemedText>
          <Button label="Close" variant="secondary" fullWidth onPress={onClose} />
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
