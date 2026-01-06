import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ThemedCard from '../components/ThemedCard';
import ThemedText from '../components/ThemedText';
import Button from '../components/Button';
import { theme } from '../theme';
import type { DocumentRecord } from '../types/documents';

export type PatientDocumentSharingScreenProps = {
  documents: DocumentRecord[];
  onBack?: () => void;
};

const PatientDocumentSharingScreen: React.FC<PatientDocumentSharingScreenProps> = ({
  documents,
  onBack,
}) => {
  const [selectedDocuments, setSelectedDocuments] = React.useState<Set<string>>(new Set());
  const [shareStatus, setShareStatus] = React.useState<'idle' | 'sharing' | 'success'>('idle');
  const [downloadStatus, setDownloadStatus] = React.useState<'idle' | 'downloading' | 'success'>('idle');

  const toggleDocument = (id: string) => {
    setSelectedDocuments((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleShareSelected = async () => {
    if (selectedDocuments.size === 0) return;

    setShareStatus('sharing');
    const selectedDocs = documents.filter((doc) => selectedDocuments.has(doc.id));
    const message = selectedDocs
      .map((doc) => `${doc.title}\n${doc.subtitle}\n${doc.summary}`)
      .join('\n\n---\n\n');

    try {
      await Share.share({
        message: `My Medical Documents:\n\n${message}`,
        title: 'Share Documents',
      });
      setShareStatus('success');
      setTimeout(() => {
        setShareStatus('idle');
        setSelectedDocuments(new Set());
      }, 2000);
    } catch (error) {
      console.error('Failed to share documents', error);
      setShareStatus('idle');
    }
  };

  const handleDownloadDocument = (doc: DocumentRecord) => {
    setDownloadStatus('downloading');
    setTimeout(() => {
      setDownloadStatus('success');
      Alert.alert(
        'Download started',
        `We'll prepare ${doc.title} as a PDF. Check your downloads or inbox shortly.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setDownloadStatus('idle');
            },
          },
        ]
      );
    }, 1500);
  };

  const handleShareAll = async () => {
    if (documents.length === 0) return;

    setShareStatus('sharing');
    const message = documents
      .map((doc) => `${doc.title}\n${doc.subtitle}\n${doc.summary}`)
      .join('\n\n---\n\n');

    try {
      await Share.share({
        message: `My Medical Documents:\n\n${message}`,
        title: 'Share All Documents',
      });
      setShareStatus('success');
      setTimeout(() => {
        setShareStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Failed to share all documents', error);
      setShareStatus('idle');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.navButton} onPress={onBack} activeOpacity={0.85}>
          <Ionicons name="arrow-back" size={18} color={theme.colors.primary.main} />
        </TouchableOpacity>
        <ThemedText variant="headline3" color="primary">
          Documents
        </ThemedText>
        <View style={styles.navButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {documents.length === 0 ? (
          <ThemedCard style={styles.emptyCard}>
            <Ionicons
              name="document-outline"
              size={48}
              color={theme.colors.primary.light}
              style={styles.emptyIcon}
            />
            <ThemedText variant="headline3" color="primary">
              No documents yet
            </ThemedText>
            <ThemedText variant="body3" color="secondary" style={styles.emptyText}>
              Your medical documents will appear here.
            </ThemedText>
          </ThemedCard>
        ) : (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText variant="headline3" color="primary">
                  Medical documents
                </ThemedText>
                <ThemedText variant="caption1" color="secondary">
                  {selectedDocuments.size} selected
                </ThemedText>
              </View>

              <View style={styles.documentsList}>
                {documents.map((doc) => {
                  const isSelected = selectedDocuments.has(doc.id);
                  return (
                    <TouchableOpacity
                      key={doc.id}
                      style={[styles.documentCard, isSelected && styles.documentCardSelected]}
                      onPress={() => toggleDocument(doc.id)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.checkboxContainer}>
                        <View
                          style={[
                            styles.checkbox,
                            isSelected && styles.checkboxSelected,
                          ]}
                        >
                          {isSelected && (
                            <Ionicons
                              name="checkmark"
                              size={16}
                              color={theme.colors.neutral.white}
                            />
                          )}
                        </View>
                      </View>

                      <View style={styles.documentInfo}>
                        <ThemedText variant="body2" color="primary">
                          {doc.title}
                        </ThemedText>
                        <ThemedText variant="caption1" color="secondary">
                          {doc.subtitle}
                        </ThemedText>
                        <ThemedText variant="caption1" color="secondary" style={styles.summary}>
                          {doc.summary}
                        </ThemedText>
                        <View style={styles.documentMeta}>
                          <ThemedText variant="caption2" color="secondary">
                            {doc.author}
                          </ThemedText>
                          <ThemedText variant="caption2" color="secondary">
                            {doc.date}
                          </ThemedText>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.downloadButton}
                        onPress={() => handleDownloadDocument(doc)}
                        activeOpacity={0.85}
                      >
                        <Ionicons
                          name="download-outline"
                          size={18}
                          color={theme.colors.primary.main}
                        />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.actionsSection}>
              <Button
                label={shareStatus === 'success' ? 'Shared!' : 'Share selected'}
                variant="primary"
                disabled={selectedDocuments.size === 0 || shareStatus === 'sharing'}
                onPress={handleShareSelected}
              />
              <Button
                label={shareStatus === 'success' ? 'Shared!' : 'Share all'}
                variant="secondary"
                disabled={shareStatus === 'sharing'}
                onPress={handleShareAll}
              />
            </View>

            {shareStatus === 'success' && (
              <ThemedCard style={styles.successCard}>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={theme.colors.semantic.success}
                />
                <ThemedText variant="body3" color="primary">
                  Documents shared successfully
                </ThemedText>
              </ThemedCard>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.muted,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  documentsList: {
    gap: theme.spacing.md,
  },
  documentCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.card,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    alignItems: 'flex-start',
  },
  documentCardSelected: {
    backgroundColor: theme.colors.primary.light,
    borderColor: theme.colors.primary.main,
  },
  checkboxContainer: {
    paddingTop: theme.spacing.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  documentInfo: {
    flex: 1,
    gap: theme.spacing.xs / 2,
  },
  summary: {
    marginTop: theme.spacing.xs,
  },
  documentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border.light,
  },
  downloadButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsSection: {
    gap: theme.spacing.md,
  },
  emptyCard: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xxl,
  },
  emptyIcon: {
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    textAlign: 'center',
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.semantic.successLight,
  },
});

export default PatientDocumentSharingScreen;
