import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Eye, EyeOff, ChevronDown } from 'lucide-react-native';
import { COLORS, SHADOWS } from '@/constants/colors';

interface FormInputProps {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onValueChange?: (value: number) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'off' | 'username' | 'password' | 'email' | 'name' | 'tel' | 'street-address' | 'postal-code' | 'cc-number' | 'cc-csc' | 'cc-exp' | 'cc-exp-month' | 'cc-exp-year';
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ComponentType<any>;
  picker?: boolean;
  pickerItems?: { label: string; value: string | number }[];
}

export function FormInput({
  label,
  placeholder,
  value,
  onChangeText,
  onValueChange,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoComplete,
  maxLength,
  multiline = false,
  numberOfLines = 1,
  editable = true,
  leftIcon,
  rightIcon,
  icon,
  picker = false,
  pickerItems = [],
}: FormInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const showPasswordToggle = secureTextEntry && !rightIcon;
  const selectedItem = pickerItems.find(item => String(item.value) === value);

  const handlePickerSelect = (selectedValue: string | number) => {
    onChangeText(String(selectedValue));
    if (onValueChange && typeof selectedValue === 'number') {
      onValueChange(selectedValue);
    }
    setIsPickerVisible(false);
  };

  if (picker) {
    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        <TouchableOpacity
          style={[
            styles.inputContainer,
            styles.pickerContainer,
            error && styles.error,
            !editable && styles.disabled
          ]}
          onPress={() => setIsPickerVisible(true)}
          disabled={!editable}
        >
          {(leftIcon || icon) && (
            <View style={styles.leftIconContainer}>
              {leftIcon || (icon && React.createElement(icon, { size: 20, color: COLORS.darkGray }))}
            </View>
          )}
          <Text style={[
            styles.pickerText,
            !selectedItem && styles.placeholderText,
            ...(leftIcon ? [styles.inputWithLeftIcon] : []),
          ]}>
            {selectedItem ? selectedItem.label : placeholder}
          </Text>
          <View style={styles.rightIconContainer}>
            <ChevronDown size={20} color={COLORS.darkGray} />
          </View>
        </TouchableOpacity>
        {error && <Text style={styles.errorText}>{error}</Text>}
        
        <Modal
          visible={isPickerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsPickerVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setIsPickerVisible(false)}
          >
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>{label || 'Select Option'}</Text>
                <TouchableOpacity onPress={() => setIsPickerVisible(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={pickerItems}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.pickerItem,
                      String(item.value) === value && styles.selectedPickerItem
                    ]}
                    onPress={() => handlePickerSelect(item.value)}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      String(item.value) === value && styles.selectedPickerItemText
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputContainer,
        isFocused && styles.focused,
        error && styles.error,
        !editable && styles.disabled
      ]}>
        {(leftIcon || icon) && (
          <View style={styles.leftIconContainer}>
            {leftIcon || (icon && React.createElement(icon, { size: 20, color: COLORS.darkGray }))}
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            ...(leftIcon ? [styles.inputWithLeftIcon] : []),
            ...((rightIcon || showPasswordToggle) ? [styles.inputWithRightIcon] : []),
            ...(multiline ? [styles.multilineInput] : []),
          ]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete as any}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {showPasswordToggle && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={togglePasswordVisibility}
            activeOpacity={0.7}
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color={COLORS.gray} />
            ) : (
              <Eye size={20} color={COLORS.gray} />
            )}
          </TouchableOpacity>
        )}
        {rightIcon && (
          <View style={styles.rightIconContainer}>
            {rightIcon}
          </View>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
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
    color: COLORS.text,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  focused: {
    borderColor: COLORS.maroon,
    ...SHADOWS.small,
  },
  error: {
    borderColor: COLORS.error,
    backgroundColor: '#FF3B3010',
  },
  disabled: {
    backgroundColor: COLORS.lightGray,
    opacity: 0.6,
    shadowOpacity: 0.3,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  multilineInput: {
    paddingTop: 16,
    textAlignVertical: 'top',
  },
  leftIconContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  rightIconContainer: {
    paddingRight: 16,
    paddingLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 8,
    marginLeft: 4,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: -0.3,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerText: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
  placeholderText: {
    color: COLORS.textLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerModal: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: '90%',
    maxHeight: '70%',
    borderWidth: 4,
    borderColor: COLORS.black,
    ...SHADOWS.brutal,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.black,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    textTransform: 'uppercase',
  },
  closeButton: {
    fontSize: 24,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  pickerItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  selectedPickerItem: {
    backgroundColor: COLORS.lightMaroon,
  },
  pickerItemText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
  selectedPickerItemText: {
    color: COLORS.maroon,
    fontWeight: '800',
  },
});