import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Search } from 'lucide-react-native';
import { FormInput } from './FormInput';
import { COLORS, SHADOWS } from '@/constants/colors';

interface CountryCode {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}

const COUNTRY_CODES: CountryCode[] = [
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', dialCode: '+974' },
];

interface PhoneInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
  countryCode: string;
  onCountryCodeChange: (countryCode: string) => void;
}

export function PhoneInput({
  label,
  value,
  onChangeText,
  error,
  placeholder = 'Phone number',
  countryCode,
  onCountryCodeChange,
}: PhoneInputProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCountry = COUNTRY_CODES.find(country => country.dialCode === countryCode) || COUNTRY_CODES[0];

  const filteredCountries = COUNTRY_CODES.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.dialCode.includes(searchQuery) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectCountry = (country: CountryCode) => {
    onCountryCodeChange(country.dialCode);
    setIsModalVisible(false);
    setSearchQuery('');
  };

  const renderCountryItem = ({ item }: { item: CountryCode }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => selectCountry(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.flag}>{item.flag}</Text>
      <View style={styles.countryInfo}>
        <Text style={styles.countryName}>{item.name}</Text>
        <Text style={styles.dialCode}>{item.dialCode}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.phoneContainer}>
        <View style={styles.countrySelector}>
          <Text style={styles.selectedFlag}>{selectedCountry.flag}</Text>
          <Text style={styles.selectedDialCode}>{selectedCountry.dialCode}</Text>
        </View>
        <View style={styles.phoneInputContainer}>
          <FormInput
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            keyboardType="phone-pad"
            error={error}
          />
        </View>
      </View>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchContainer}>
            <FormInput
              placeholder="Search countries..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon={<Search size={20} color={COLORS.gray} />}
            />
          </View>

          <FlatList
            data={filteredCountries}
            renderItem={renderCountryItem}
            keyExtractor={(item) => item.code}
            style={styles.countryList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.black,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    opacity: 0.9,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 0,
    borderWidth: 4,
    borderColor: COLORS.black,
    paddingHorizontal: 12,
    paddingVertical: 16,
    marginRight: 8,
    minWidth: 100,
    ...SHADOWS.brutal,
  },
  selectedFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  selectedDialCode: {
    fontSize: 16,
    color: COLORS.black,
    marginRight: 4,
    fontWeight: '800',
  },
  phoneInputContainer: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 4,
    borderBottomColor: COLORS.black,
    backgroundColor: COLORS.maroon,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: COLORS.gold,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 4,
    borderBottomColor: COLORS.black,
  },
  countryList: {
    flex: 1,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.black,
  },
  flag: {
    fontSize: 24,
    marginRight: 16,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: '700',
  },
  dialCode: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginTop: 2,
    fontWeight: '600',
  },
});