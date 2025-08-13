import React, { useState } from 'react';
import { Platform, Modal, Pressable, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export default function DateField({ 
  label, 
  value, 
  onChange 
}: {
  label: string; 
  value: Date; 
  onChange: (d: Date) => void;
}) {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <Text style={{ fontWeight: '600', marginBottom: 6 }}>{label}</Text>
      <Pressable 
        onPress={() => setOpen(true)} 
        style={{ 
          borderWidth: 1, 
          borderColor: '#DDD', 
          borderRadius: 12, 
          padding: 14, 
          marginBottom: 12 
        }}
      >
        <Text>{value.toISOString().slice(0, 10)}</Text>
      </Pressable>
      
      {Platform.OS === 'ios' ? (
        <Modal 
          transparent 
          visible={open} 
          animationType="slide" 
          onRequestClose={() => setOpen(false)}
        >
          <View style={{ 
            flex: 1, 
            justifyContent: 'flex-end', 
            backgroundColor: 'rgba(0,0,0,0.3)' 
          }}>
            <View style={{ 
              backgroundColor: '#fff', 
              padding: 12, 
              borderTopLeftRadius: 16, 
              borderTopRightRadius: 16 
            }}>
              <DateTimePicker 
                value={value} 
                mode="date" 
                display="inline" 
                onChange={(e: DateTimePickerEvent, d?: Date) => {
                  if (d) onChange(d);
                  setOpen(false);
                }}
              />
            </View>
          </View>
        </Modal>
      ) : open && (
        <DateTimePicker 
          value={value} 
          mode="date" 
          display="calendar" 
          onChange={(e, d) => { 
            setOpen(false); 
            if (d) onChange(d); 
          }} 
        />
      )}
    </>
  );
}
