import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Switch, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';
import BrutalHeader from '@/components/BrutalHeader';
import { useLanguage } from '@/hooks/useLanguageStore';
import BrutalCard from '@/components/BrutalCard';
import BrutalButton from '@/components/BrutalButton';
import { useFinanceStore } from '@/hooks/useFinanceStore';
import { useAuth } from '@/hooks/useAuthStore';
import { 
  Globe, 
  CreditCard, 
  FileText, 
  Lock 
} from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { user, updateUser, clearAllData } = useFinanceStore();
  const { logout } = useAuth();
  
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  
  const toggleAutoAddSalary = () => {
    if (user) {
      updateUser({
        ...user,
        autoAddSalary: !user.autoAddSalary,
      });
    }
  };
  
  const toggleBiometric = async () => {
    try {
      // In a real app, you would use expo-local-authentication here
      setBiometricEnabled(!biometricEnabled);
      Alert.alert(
        'Biometric Authentication',
        biometricEnabled ? 'Biometric authentication disabled' : 'Biometric authentication enabled'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle biometric authentication');
    }
  };
  
  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Your data will be exported as a CSV file. This feature will be available soon.',
      [{ text: 'OK' }]
    );
  };
  
  const toggleLanguage = () => {
    const next = language === 'en' ? 'ar' : 'en';
    setLanguage(next);
  };

  return (
    <SafeAreaView style={styles.container}>
      <BrutalHeader 
        title={t.settings}
        subtitle={t.customizeExperience}
      />
      
      <ScrollView style={styles.scrollView}>
        {user && (
          <BrutalCard style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileInitial}>{user.full_name.charAt(0)}</Text>
              </View>
              <View style={styles.profileInfo}>
                                  <Text style={styles.profileName}>{user.full_name}</Text>
                <Text style={styles.profileEmail}>{user.email}</Text>
              </View>
            </View>
            <BrutalButton 
              title="Edit Profile" 
              onPress={() => {}} 
              variant="outline"
              size="small"
            />
          </BrutalCard>
        )}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.preferences}</Text>
          
          <BrutalCard>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Globe size={20} color={COLORS.black} />
                </View>
                <Text style={styles.settingText}>{t.languageLabel}</Text>
              </View>
              <TouchableOpacity 
                style={styles.languageToggle}
                onPress={toggleLanguage}
              >
                <Text style={[
                  styles.languageOption,
                   language === 'en' && styles.activeLanguage
                ]}>EN</Text>
                <Text style={[
                  styles.languageOption,
                  language === 'ar' && styles.activeLanguage
                ]}>AR</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <CreditCard size={20} color={COLORS.black} />
                </View>
                  <Text style={styles.settingText}>{t.autoAddSalary}</Text>
              </View>
              <Switch
                value={user?.autoAddSalary || false}
                onValueChange={toggleAutoAddSalary}
                trackColor={{ false: COLORS.lightGray, true: COLORS.maroon }}
                thumbColor={COLORS.white}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Lock size={20} color={COLORS.black} />
                </View>
                  <Text style={styles.settingText}>{t.biometricAuth}</Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={toggleBiometric}
                trackColor={{ false: COLORS.lightGray, true: COLORS.maroon }}
                thumbColor={COLORS.white}
              />
            </View>
          </BrutalCard>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.subscription}</Text>
          
          <BrutalCard style={styles.subscriptionCard}>
            <Text style={styles.planName}>{t.premiumPlan}</Text>
            <Text style={styles.planPrice}>{t.planPrice}</Text>
            <Text style={styles.planDescription}>{t.planDescription}</Text>
          </BrutalCard>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.dataLabel}</Text>
          
          <BrutalCard>
            <TouchableOpacity style={styles.dataOption} onPress={handleExportData}>
              <View style={styles.dataOptionLeft}>
                <FileText size={20} color={COLORS.black} />
                <Text style={styles.dataOptionText}>{t.exportDataCsv}</Text>
              </View>
            </TouchableOpacity>
          </BrutalCard>
          
          <BrutalCard style={styles.dangerCard}>
            <TouchableOpacity 
              style={styles.dataOption}
              onPress={() => {
                Alert.alert(
                 t.clearAllDataTesting,
                 '',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Clear Data', style: 'destructive', onPress: clearAllData }
                  ]
                );
              }}
            >
              <View style={styles.dataOptionLeft}>
                <Text style={styles.dangerText}>{t.clearAllDataTesting}</Text>
              </View>
            </TouchableOpacity>
            

          </BrutalCard>
        </View>
        
        <View style={styles.buttonContainer}>
          <BrutalButton 
            title={t.logout} 
            onPress={() => {
              Alert.alert(
                t.logoutConfirmTitle,
                t.logoutConfirmBody,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Logout', style: 'destructive', onPress: async () => {
                    await logout();
                    router.replace('/auth/welcome');
                  }}
                ]
              );
            }} 
            variant="outline"
            style={styles.logoutButton}
            testID="logoutButton"
          />
          
          <BrutalButton 
            title={t.deleteAccount} 
            onPress={() => {}} 
            variant="outline"
            style={styles.deleteButton}
            textStyle={styles.deleteButtonText}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 0,
    backgroundColor: COLORS.maroon,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  profileInitial: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.black,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
    color: COLORS.black,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    color: COLORS.black,
  },
  languageToggle: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  languageOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    fontWeight: '700',
  },
  activeLanguage: {
    backgroundColor: COLORS.maroon,
    color: COLORS.white,
  },
  subscriptionCard: {
    backgroundColor: COLORS.gold,
  },
  planName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.black,
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.black,
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 14,
    color: COLORS.black,
  },
  dataOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dataOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataOptionText: {
    fontSize: 16,
    color: COLORS.black,
    marginLeft: 12,
  },
  buttonContainer: {
    marginBottom: 32,
  },
  logoutButton: {
    marginBottom: 16,
  },
  deleteButton: {
    borderColor: COLORS.error,
  },
  deleteButtonText: {
    color: COLORS.error,
  },
  dangerCard: {
    backgroundColor: '#FFE5E5',
    marginTop: 12,
  },
  dangerText: {
    fontSize: 16,
    color: COLORS.error,
    fontWeight: '700',
  },
});