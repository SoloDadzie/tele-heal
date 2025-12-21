import React from 'react';
import { Alert, Modal, ScrollView, Share, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from '../components/ThemedText';
import ThemedCard from '../components/ThemedCard';
import Button from '../components/Button';
import { theme } from '../theme';
import { DocumentRecord } from '../types/documents';

type DocumentArchiveScreenProps = {
  onBack: () => void;
  documents: DocumentRecord[];
  initialDocumentId?: string | null;
};

const DocumentArchiveScreen: React.FC<DocumentArchiveScreenProps> = ({ onBack, documents, initialDocumentId }) => {
  const [activeDocument, setActiveDocument] = React.useState<DocumentRecord | null>(null);

  const handleOpenDocument = (doc: DocumentRecord) => {
    setActiveDocument(doc);
  };

  const handleCloseModal = () => setActiveDocument(null);

  const handleShareDocument = async () => {
    if (!activeDocument) return;
    try {
      await Share.share({
        title: activeDocument.title,
        message: `${activeDocument.title}\n${activeDocument.subtitle}\n\n${activeDocument.summary ?? 'No summary provided yet.'}`,
      });
    } catch (error) {
      console.error('Failed to share document', error);
      Alert.alert('Unable to share', 'Please try again in a moment.');
    }
  };

  const handleDownloadDocument = () => {
    if (!activeDocument) return;
    Alert.alert(
      'Download started',
      `We'll prepare ${activeDocument.title} as a PDF. Check your downloads or inbox shortly.`,
      [{ text: 'OK', onPress: handleCloseModal }],
    );
  };

  React.useEffect(() => {
    if (initialDocumentId) {
      const doc = documents.find((d) => d.id === initialDocumentId);
      if (doc) {
        setActiveDocument(doc);
      }
    }
  }, [initialDocumentId, documents]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.topBarButton} onPress={onBack} activeOpacity={0.85}>
            <Ionicons name="arrow-back" size={20} color={theme.colors.primary.main} />
          </TouchableOpacity>
          <ThemedText variant="headline2" color="primary">
            Documents & results
          </ThemedText>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {documents.map((doc) => (
            <ThemedCard key={doc.id} style={styles.documentCard}>
              <View style={styles.documentIcon}>
                <Ionicons name="document-text-outline" size={20} color={theme.colors.primary.main} />
              </View>
              <View style={styles.documentContent}>
                <ThemedText variant="body2" color="primary">
                  {doc.title}
                </ThemedText>
                <ThemedText variant="body3" color="secondary">
                  {doc.subtitle}
                </ThemedText>
              </View>
              <View style={styles.documentMeta}>
                <ThemedText variant="caption1" color="secondary">
                  {doc.date}
                </ThemedText>
                <TouchableOpacity activeOpacity={0.85} onPress={() => handleOpenDocument(doc)}>
                  <ThemedText variant="body3" color="primary">
                    View
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </ThemedCard>
          ))}

          {documents.length === 0 && (
            <ThemedCard style={styles.emptyCard}>
              <Ionicons name="folder-open-outline" size={20} color={theme.colors.primary.main} />
              <ThemedText variant="body2" color="primary">
                No archived documents yet.
              </ThemedText>
            </ThemedCard>
          )}
        </ScrollView>

        <Modal visible={!!activeDocument} animationType="slide" transparent onRequestClose={handleCloseModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View>
                  <ThemedText variant="headline3" color="primary">
                    {activeDocument?.title}
                  </ThemedText>
                  <ThemedText variant="caption1" color="secondary">
                    {activeDocument?.date} • {activeDocument?.author ?? 'TeleHeal'}
                  </ThemedText>
                </View>
                <TouchableOpacity onPress={handleCloseModal} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close" size={20} color={theme.colors.text.primary} />
                </TouchableOpacity>
              </View>
              <View style={styles.summaryBlock}>
                <ThemedText variant="caption1" color="secondary">
                  Summary
                </ThemedText>
                <ThemedText variant="body3" color="primary">
                  {activeDocument?.summary ?? 'No summary available for this document yet.'}
                </ThemedText>
              </View>
              <View style={styles.modalActions}>
                <Button label="Share summary" variant="secondary" fullWidth onPress={handleShareDocument} />
                <Button label="Download PDF" variant="primary" fullWidth onPress={handleDownloadDocument} />
              </View>
            </View>
          </View>
        </Modal>
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
    gap: theme.spacing.md,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  documentIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentContent: {
    flex: 1,
  },
  documentMeta: {
    alignItems: 'flex-end',
    gap: theme.spacing.xs / 2,
  },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.background.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalCard: {
    width: '100%',
    borderRadius: theme.borderRadius.xxxl,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  summaryBlock: {
    gap: theme.spacing.xs,
  },
  modalActions: {
    gap: theme.spacing.sm,
  },
});

export default DocumentArchiveScreen;
