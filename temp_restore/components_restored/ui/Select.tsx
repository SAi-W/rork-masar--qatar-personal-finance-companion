import React, { useState } from 'react';
import { Modal, Pressable, Text, View, FlatList } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

type Option = { label: string; value: string };

interface SelectProps {
  label: string;
  value?: string;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export default function Select({ 
  label, 
  value, 
  options, 
  onChange, 
  placeholder = 'Select an option',
  error 
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value)?.label ?? placeholder;
  
  return (
    <View style={{ marginBottom: 16 }}>
      {label && (
        <Text style={{ 
          fontSize: 16, 
          fontWeight: '800', 
          color: '#333', 
          marginBottom: 8, 
          textTransform: 'uppercase', 
          letterSpacing: -0.5, 
          opacity: 0.9 
        }}>
          {label}
        </Text>
      )}
      
      <Pressable 
        onPress={() => setOpen(true)} 
        style={{
          borderWidth: 1,
          borderColor: error ? '#FF3B30' : '#E5E7EB',
          borderRadius: 12,
          padding: 14,
          backgroundColor: '#fff',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Text style={{ 
          fontSize: 16, 
          color: value ? '#333' : '#9CA3AF',
          fontWeight: '600'
        }}>
          {selected}
        </Text>
        <ChevronDown size={20} color="#9CA3AF" />
      </Pressable>
      
      {error && (
        <Text style={{ 
          fontSize: 12, 
          color: '#FF3B30', 
          marginTop: 8, 
          marginLeft: 4, 
          fontWeight: '700', 
          textTransform: 'uppercase', 
          letterSpacing: -0.3 
        }}>
          {error}
        </Text>
      )}
      
      <Modal 
        visible={open} 
        transparent 
        animationType="slide" 
        onRequestClose={() => setOpen(false)}
      >
        <View style={{
          flex: 1, 
          backgroundColor: 'rgba(0,0,0,0.3)', 
          justifyContent: 'flex-end'
        }}>
          <View style={{
            backgroundColor: '#fff', 
            borderTopLeftRadius: 16, 
            borderTopRightRadius: 16, 
            maxHeight: '60%'
          }}>
            <View style={{
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#E5E7EB',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#333' }}>
                {label}
              </Text>
              <Pressable onPress={() => setOpen(false)}>
                <Text style={{ fontSize: 16, color: '#007AFF', fontWeight: '500' }}>
                  Cancel
                </Text>
              </Pressable>
            </View>
            
            <FlatList 
              data={options} 
              keyExtractor={o => o.value}
              renderItem={({ item }) => (
                <Pressable 
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }} 
                  style={{
                    padding: 16, 
                    borderBottomWidth: 1, 
                    borderBottomColor: '#F3F4F6',
                    backgroundColor: value === item.value ? '#F3F4F6' : '#fff'
                  }}
                >
                  <Text style={{ 
                    fontSize: 16, 
                    color: '#333',
                    fontWeight: value === item.value ? '600' : '400'
                  }}>
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
