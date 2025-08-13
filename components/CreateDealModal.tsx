import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { COLORS } from '@/constants/colors';
import BrutalButton from '@/components/BrutalButton';
import BrutalCard from '@/components/BrutalCard';
import CategoryIcon from '@/components/CategoryIcon';
import FormSheet from './ui/FormSheet';
import Select from './ui/Select';
import { FormInput } from './FormInput';
import DateField from './form/DateField';
import { Category } from '@/types';
import { formatMoney, parseMoneyToMinor, DEFAULT_CURRENCY } from '@/utils/currency';
import { X, Camera, MapPin, Calendar, DollarSign, Percent, Store } from 'lucide-react-native';

interface CreateDealModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (dealData: {
    title: string;
    merchant: string;
    description: string;
    category: string;
    amount: number;
    discount: number;
    validUntil: string;
    location?: string;
    imageUrl?: string;
  }) => Promise<void>;
}

const categories: Category[] = ['food', 'entertainment', 'shopping', 'health', 'transportation', 'travel', 'education'];

export default function CreateDealModal({ visible, onClose, onSubmit }: CreateDealModalProps) {
  const [title, setTitle] = useState('');
  const [merchant, setMerchant] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('food');
  const [amount, setAmount] = useState('');
  const [discount, setDiscount] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !merchant.trim() || !description.trim() || !amount || !discount || !validUntil) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    if (parseFloat(amount) <= 0 || parseFloat(discount) < 0) {
      Alert.alert('Invalid Values', 'Amount must be greater than 0 and discount must be 0 or greater.');
      return;
    }

    try {
      setIsSubmitting(true);
      const amountMinor = parseMoneyToMinor(amount);
      const discountMinor = parseMoneyToMinor(discount);
      
      await onSubmit({
        title: title.trim(),
        merchant: merchant.trim(),
        description: description.trim(),
        category,
        amount: amountMinor / 100, // Convert back to major units for API compatibility
        discount: discountMinor / 100,
        validUntil,
        location: location.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
      });

      // Reset form
      resetForm();
      onClose();
      Alert.alert('Success', 'Deal created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create deal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setMerchant('');
    setDescription('');
    setCategory('food');
    setAmount('');
    setDiscount('');
    setLocation('');
    setImageUrl('');
    setValidUntil('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getCurrentDate = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const categoryOptions = categories.map(cat => ({ 
    label: cat.charAt(0).toUpperCase() + cat.slice(1), 
    value: cat 
  }));

  if (!visible) return null;

  const header = (
    <View style={styles.header}>
      <Text style={styles.title}>Create New Deal</Text>
      <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
        <X size={24} color={COLORS.darkGray} />
      </TouchableOpacity>
    </View>
  );

  const footer = (
    <View style={styles.footer}>
      <BrutalButton
        title="Cancel"
        onPress={handleClose}
        variant="secondary"
        style={styles.cancelButton}
      />
      <BrutalButton
        title="Create Deal"
        onPress={handleSubmit}
        variant="primary"
        loading={isSubmitting}
        style={styles.submitButton}
      />
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <FormSheet header={header} footer={footer}>
        <FormInput
          label="Deal Title"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., 50% off on Pizza"
          icon={Store}
        />

        <FormInput
          label="Merchant"
          value={merchant}
          onChangeText={setMerchant}
          placeholder="e.g., Pizza Hut"
          icon={Store}
        />

        <FormInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the deal..."
          multiline
          numberOfLines={3}
        />

        <Select
          label="Category"
          value={category}
          options={categoryOptions}
          onChange={(value: string) => setCategory(value as Category)}
          placeholder="Select category"
        />

        <FormInput
          label="Original Price"
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          keyboardType="decimal-pad"
          icon={DollarSign}
        />

        <FormInput
          label="Discount Amount"
          value={discount}
          onChangeText={setDiscount}
          placeholder="0.00"
          keyboardType="decimal-pad"
          icon={Percent}
        />

        <DateField
          label="Valid Until"
          value={validUntil ? new Date(validUntil) : new Date()}
          onChange={(d) => setValidUntil(d.toISOString().slice(0,10))}
        />

        <FormInput
          label="Location (Optional)"
          value={location}
          onChangeText={setLocation}
          placeholder="e.g., Mall of Qatar"
          icon={MapPin}
        />

        <FormInput
          label="Image URL (Optional)"
          value={imageUrl}
          onChangeText={setImageUrl}
          placeholder="https://example.com/image.jpg"
        />
      </FormSheet>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  closeButton: {
    padding: 5,
  },
  footer: {
    flexDirection: 'row',
    gap: 15,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});
