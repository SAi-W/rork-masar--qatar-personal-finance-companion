import React, { ReactNode } from 'react';
import { Platform, KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = { 
  header: ReactNode; 
  children: ReactNode; 
  footer: ReactNode; 
};

export default function FormSheet({ header, children, footer }: Props) {
  const insets = useSafeAreaInsets();
  
  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {header}
        <ScrollView 
          contentInsetAdjustmentBehavior="always" 
          keyboardShouldPersistTaps="handled"
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16 }}
        >
          {children}
        </ScrollView>
        <View style={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 12),
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#EEE'
        }}>
          {footer}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
