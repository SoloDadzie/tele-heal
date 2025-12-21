import React from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ThemedText from '../components/ThemedText';
import ThemedCard from '../components/ThemedCard';
import { theme } from '../theme';

export type LabRequest = {
  id: string;
  name: string;
  orderingDoctor: string;
  orderedOn: string;
  status: 'scheduled' | 'processing' | 'ready';
  instructions: string;
};

export type LabUpload = {
  id: string;
  name: string;
  submittedAt: string;
  uri: string;
  status: 'pendingReview' | 'reviewed';
};

type LabsScreenProps = {
  onBack: () => void;
  labRequests: LabRequest[];
  uploadedResults: LabUpload[];
  onUploadResult: (payload: { uri: string; name?: string }) => void;
};

const LabsScreen: React.FC<LabsScreenProps> = ({ onBack, labRequests, uploadedResults, onUploadResult }) => {
  const pickDocument = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow TeleHeal to access your library to upload results.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: false,
      quality: 0.8,
    });

    if (result.canceled) return;
    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    onUploadResult({
      uri: asset.uri,
      name: asset.fileName ?? 'Lab result',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.topBarButton} onPress={onBack} activeOpacity={0.85}>
            <Ionicons name='arrow-back' size={20} color={theme.colors.primary.main} />
          </TouchableOpacity>
          <ThemedText variant='headline2' color='primary'>
            Labs & scans
          </ThemedText>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <ThemedCard style={styles.heroCard}>
            <View style={styles.heroBadge}>
              <Ionicons name='flask-outline' size={14} color={theme.colors.neutral.white} />
              <ThemedText variant='caption1' color='inverse'>
                From your doctor
              </ThemedText>
            </View>
            <ThemedText variant='headline1' color='inverse'>
              Review requests and share completed results
            </ThemedText>
            <ThemedText variant='body3' color='inverse'>
              Bring outside lab or imaging reports into TeleHeal so your care team can keep everything in sync.
            </ThemedText>
          </ThemedCard>

          <ThemedCard style={styles.requestsCard}>
            <View style={styles.cardHeader}>
              <Ionicons name='clipboard-outline' size={18} color={theme.colors.primary.main} />
              <ThemedText variant='headline3' color='primary'>
                Requests from your doctor
              </ThemedText>
            </View>
            {labRequests.map((req) => (
              <View key={req.id} style={styles.requestRow}>
                <View style={{ flex: 1, gap: theme.spacing.xs }}>
                  <ThemedText variant='body2' color='primary'>
                    {req.name}
                  </ThemedText>
                  <ThemedText variant='caption1' color='secondary'>
                    Ordered by {req.orderingDoctor} • {req.orderedOn}
                  </ThemedText>
                  <ThemedText variant='caption1' color='secondary'>
                    {req.instructions}
                  </ThemedText>
                </View>
                <View style={[styles.statusTag, styles[`status_${req.status}` as const]]}>
                  <ThemedText variant='caption2' color={req.status === 'ready' ? 'inverse' : 'primary'}>
                    {req.status === 'scheduled' && 'Scheduled'}
                    {req.status === 'processing' && 'Processing'}
                    {req.status === 'ready' && 'Ready'}
                  </ThemedText>
                </View>
              </View>
            ))}
            {labRequests.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name='checkmark-circle-outline' size={20} color={theme.colors.primary.main} />
                <ThemedText variant='body3' color='secondary'>
                  No pending lab or imaging orders.
                </ThemedText>
              </View>
            )}
          </ThemedCard>

          <ThemedCard style={styles.uploadCard}>
            <View style={styles.cardHeader}>
              <Ionicons name='cloud-upload-outline' size={18} color={theme.colors.primary.main} />
              <ThemedText variant='headline3' color='primary'>
                Upload lab / scan result
              </ThemedText>
            </View>
            <TouchableOpacity style={styles.uploadCta} onPress={pickDocument} activeOpacity={0.9}>
              <View style={styles.uploadLeft}>
                <View style={styles.uploadIcon}>
                  <Ionicons name='add' size={22} color={theme.colors.primary.main} />
                </View>
                <View>
                  <ThemedText variant='body2' color='primary'>
                    Choose from files or photos
                  </ThemedText>
                  <ThemedText variant='caption1' color='secondary'>
                    PDF, JPG, PNG • up to 10 MB
                  </ThemedText>
                </View>
              </View>
              <Ionicons name='chevron-forward' size={18} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </ThemedCard>

          <ThemedCard style={styles.resultsCard}>
            <View style={styles.cardHeader}>
              <Ionicons name='documents-outline' size={18} color={theme.colors.primary.main} />
              <ThemedText variant='headline3' color='primary'>
                Results you shared
              </ThemedText>
            </View>
            {uploadedResults.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name='folder-outline' size={20} color={theme.colors.primary.main} />
                <ThemedText variant='body3' color='secondary'>
                  Upload completed labs or imaging here so your doctor can review them.
                </ThemedText>
              </View>
            ) : (
              uploadedResults.map((upload) => (
                <View key={upload.id} style={styles.uploadRow}>
                  <View style={{ flex: 1 }}>
                    <ThemedText variant='body2' color='primary'>
                      {upload.name}
                    </ThemedText>
                    <ThemedText variant='caption1' color='secondary'>
                      Submitted {upload.submittedAt}
                    </ThemedText>
                  </View>
                  <View style={[styles.statusTag, upload.status === 'pendingReview' ? styles.status_processing : styles.status_ready]}>
                    <ThemedText variant='caption2' color={upload.status === 'pendingReview' ? 'primary' : 'inverse'}>
                      {upload.status === 'pendingReview' ? 'Under review' : 'Reviewed'}
                    </ThemedText>
                  </View>
                </View>
              ))
            )}
          </ThemedCard>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.muted,
  },
  root: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  topBarButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  heroCard: {
    borderRadius: theme.borderRadius.xxxl,
    backgroundColor: theme.colors.primary.dark,
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.xs,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  requestsCard: {
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  requestRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.light,
  },
  statusTag: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  status_scheduled: {
    backgroundColor: theme.colors.background.muted,
  },
  status_processing: {
    backgroundColor: theme.colors.accent.light,
  },
  status_ready: {
    backgroundColor: theme.colors.primary.main,
  },
  uploadCard: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  uploadCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.light,
  },
  uploadLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  uploadIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsCard: {
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  uploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.light,
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
});

export default LabsScreen;
