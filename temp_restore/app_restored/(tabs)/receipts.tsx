import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import BrutalHeader from '@/components/BrutalHeader';
import BrutalCard from '@/components/BrutalCard';
import BrutalButton from '@/components/BrutalButton';
import { useLanguage } from '@/hooks/useLanguageStore';
import { useFinanceStore } from '@/hooks/useFinanceStore';
import { trpc } from '@/lib/trpc';
import { useRouter } from 'expo-router';
import { formatCurrency } from '@/utils/formatters';
import { Upload, Receipt, Eye, Edit, Trash2, FileText } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

interface ReceiptData {
  id: string;
  fileUrl: string;
  thumbUrl?: string;
  merchant: string;
  amount: number;
  date: string;
  category: string;
  accountId: string;
  extractedData?: any;
}

interface ReceiptDetailModalProps {
  visible: boolean;
  receipt: ReceiptData | null;
  onClose: () => void;
  onUpdate: (receipt: ReceiptData) => void;
  onDelete: (id: string) => void;
}

const CATEGORIES = [
  'food',
  'transport',
  'entertainment',
  'shopping',
  'health',
  'education',
  'utilities',
  'subscriptions',
  'other',
];

function ReceiptDetailModal({ visible, receipt, onClose, onUpdate, onDelete }: ReceiptDetailModalProps) {
  const { accounts } = useFinanceStore();
  const [editingData, setEditingData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (receipt) {
      setEditingData({ ...receipt });
    }
  }, [receipt]);

  const handleUpdate = async () => {
    if (!editingData) return;

    setLoading(true);
    try {
      // This would typically call a backend API to update the receipt
      onUpdate(editingData);
      Alert.alert('Success', 'Receipt updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating receipt:', error);
      Alert.alert('Error', 'Failed to update receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!receipt) return;

    Alert.alert(
      'Delete Receipt',
      'Are you sure you want to delete this receipt?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            onDelete(receipt.id);
            onClose();
          }
        },
      ]
    );
  };

  if (!visible || !receipt || !editingData) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Receipt Details</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalBody}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: receipt.fileUrl }} style={styles.receiptImage} />
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Merchant:</Text>
              <Text style={styles.detailValue}>{editingData.merchant}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount:</Text>
                              <Text style={styles.detailValue}>{formatCurrency(editingData.amount)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>{editingData.date}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category:</Text>
              <Text style={styles.detailValue}>{editingData.category}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Account:</Text>
              <Text style={styles.detailValue}>
                {accounts.find(acc => acc.id === editingData.accountId)?.nickname || 'Unknown'}
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Trash2 size={16} color={COLORS.white} />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
          
          <View style={styles.actionButtons}>
            <BrutalButton
              title="Cancel"
              onPress={onClose}
              variant="secondary"
              style={styles.cancelButton}
            />
            <BrutalButton
              title="Update"
              onPress={handleUpdate}
              variant="primary"
              loading={loading}
              style={styles.updateButton}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

export default function ReceiptsScreen() {
  const { t } = useLanguage();
  const { accounts, fetchAccounts } = useFinanceStore();
  const router = useRouter();
  const extractMutation = trpc.receipts.extract.useMutation();
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAccounts();
    // Load receipts from storage/API
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    // This would typically load receipts from the backend
    // For now, we'll use mock data
    const mockReceipts: ReceiptData[] = [
      {
        id: '1',
        fileUrl: 'https://via.placeholder.com/300x400/cccccc/666666?text=Receipt+1',
        thumbUrl: 'https://via.placeholder.com/100x100/cccccc/666666?text=R1',
        merchant: 'Carrefour',
        amount: 45.67,
        date: '2025-08-10',
        category: 'food',
        accountId: '1',
      },
      {
        id: '2',
        fileUrl: 'https://via.placeholder.com/300x400/cccccc/666666?text=Receipt+2',
        thumbUrl: 'https://via.placeholder.com/100x100/cccccc/666666?text=R2',
        merchant: 'Uber',
        amount: 23.50,
        date: '2025-08-09',
        category: 'transport',
        accountId: '1',
      },
    ];
    setReceipts(mockReceipts);
  };

  const handleUploadReceipt = async () => {
    try {
      setUploading(true);

      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll access to upload receipts.');
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Use OCR endpoint to extract data
        const res = await extractMutation.mutateAsync({ fileUrl: asset.uri });
        if (res?.success) {
          const { amountMinor, dateISO, merchant, categoryGuess, receiptId } = res.suggestion;
          
          // Navigate to Add Expense with prefilled data
          router.push({
            pathname: '/(tabs)/expenses',
            params: { 
              preset: JSON.stringify({ 
                amountMinor, 
                dateISO, 
                merchant, 
                categoryGuess, 
                receiptId 
              }) 
            }
          });
        } else {
          Alert.alert('Error', 'Failed to extract receipt data. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error uploading receipt:', error);
      Alert.alert('Error', 'Failed to upload receipt. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleReceiptPress = (receipt: ReceiptData) => {
    setSelectedReceipt(receipt);
    setShowDetailModal(true);
  };

  const handleUpdateReceipt = (updatedReceipt: ReceiptData) => {
    setReceipts(receipts.map(r => r.id === updatedReceipt.id ? updatedReceipt : r));
  };

  const handleDeleteReceipt = (id: string) => {
    setReceipts(receipts.filter(r => r.id !== id));
  };

  const renderReceiptItem = (receipt: ReceiptData) => (
    <TouchableOpacity
      key={receipt.id}
      style={styles.receiptItem}
      onPress={() => handleReceiptPress(receipt)}
    >
      <View style={styles.receiptThumbnail}>
        {receipt.thumbUrl ? (
          <Image source={{ uri: receipt.thumbUrl }} style={styles.thumbnailImage} />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <FileText size={24} color={COLORS.gray} />
          </View>
        )}
      </View>

      <View style={styles.receiptInfo}>
        <Text style={styles.merchantName}>{receipt.merchant}</Text>
                        <Text style={styles.receiptAmount}>{formatCurrency(receipt.amount)}</Text>
        <Text style={styles.receiptDate}>{receipt.date}</Text>
        <Text style={styles.receiptCategory}>{receipt.category}</Text>
      </View>

      <View style={styles.receiptActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Eye size={16} color={COLORS.maroon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Edit size={16} color={COLORS.blue} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <BrutalHeader
        title="Receipts"
        subtitle="Upload and manage your receipts"
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.uploadSection}>
          <BrutalButton
            title="UPLOAD RECEIPT"
            onPress={handleUploadReceipt}
            variant="primary"

            loading={uploading}
            style={styles.uploadButton}
          />
          <Text style={styles.uploadDescription}>
            Upload receipts to automatically extract data and track expenses
          </Text>
        </View>

        <View style={styles.receiptsSection}>
          <Text style={styles.sectionTitle}>RECENT RECEIPTS</Text>
          
          {receipts.length > 0 ? (
            receipts.map(renderReceiptItem)
          ) : (
            <View style={styles.emptyState}>
              <Receipt size={48} color={COLORS.gray} />
              <Text style={styles.emptyText}>No receipts uploaded yet</Text>
              <Text style={styles.emptySubtext}>
                Upload your first receipt to get started with automated expense tracking
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <ReceiptDetailModal
        visible={showDetailModal}
        receipt={selectedReceipt}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedReceipt(null);
        }}
        onUpdate={handleUpdateReceipt}
        onDelete={handleDeleteReceipt}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  uploadSection: {
    marginBottom: 30,
    alignItems: 'center',
  },
  uploadButton: {
    width: '100%',
    marginBottom: 15,
  },
  uploadDescription: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
  receiptsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 20,
  },
  receiptItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  receiptThumbnail: {
    width: 60,
    height: 80,
    marginRight: 15,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  receiptAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.maroon,
    marginBottom: 4,
  },
  receiptDate: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 2,
  },
  receiptCategory: {
    fontSize: 12,
    color: COLORS.lightGray,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  receiptActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 6,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.lightGray,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: '90%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  closeButton: {
    fontSize: 24,
    color: COLORS.gray,
    padding: 5,
  },
  modalBody: {
    flex: 1,
  },
  imageContainer: {
    padding: 20,
    alignItems: 'center',
  },
  receiptImage: {
    width: 250,
    height: 350,
    borderRadius: 8,
  },
  detailsContainer: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.black,
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.text,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.red,
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    gap: 8,
  },
  deleteButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  cancelButton: {
    flex: 1,
  },
  updateButton: {
    flex: 2,
  },
});
