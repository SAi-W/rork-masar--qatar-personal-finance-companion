import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import BrutalHeader from '@/components/BrutalHeader';
import SubscriptionCard from '@/components/SubscriptionCard';
import BrutalButton from '@/components/BrutalButton';
import { useSubscriptions } from '@/hooks/useFinanceStore';
import AddSubscriptionModal from '@/components/AddSubscriptionModal';
import { Plus, Edit, Trash2 } from 'lucide-react-native';
import { Subscription } from '@/types';

export default function SubscriptionsScreen() {
  const { subscriptions, fetchSubscriptions } = useSubscriptions();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  const canceledSubscriptions = subscriptions.filter(sub => sub.status === 'canceled');
  const upcomingSubscriptions = subscriptions.filter(sub => {
    if (sub.status !== 'active') return false;
    const dueDate = new Date(sub.nextBillingDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return dueDate >= today && dueDate <= thirtyDaysFromNow;
  });

  return (
    <SafeAreaView style={styles.container}>
      <BrutalHeader 
        title="Subscriptions" 
        subtitle="Manage your recurring payments"
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACTIVE SUBSCRIPTIONS</Text>
          {activeSubscriptions.length > 0 ? (
            activeSubscriptions.map(subscription => (
              <View key={subscription.id} style={styles.subscriptionContainer}>
                <SubscriptionCard subscription={subscription} />
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => setEditingSubscription(subscription)}
                  >
                    <Edit size={16} color={COLORS.maroon} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Trash2 size={16} color={COLORS.red} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No active subscriptions</Text>
            </View>
          )}
        </View>

        {upcomingSubscriptions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>UPCOMING (30 DAYS)</Text>
            {upcomingSubscriptions.map(subscription => (
              <SubscriptionCard key={subscription.id} subscription={subscription} />
            ))}
          </View>
        )}
        
        {canceledSubscriptions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>HISTORY</Text>
            {canceledSubscriptions.map(subscription => (
              <SubscriptionCard key={subscription.id} subscription={subscription} />
            ))}
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          <BrutalButton 
            title="ADD SUBSCRIPTION" 
            onPress={() => setShowAddModal(true)} 
            variant="primary"

          />
        </View>
      </ScrollView>

      <AddSubscriptionModal
        visible={showAddModal || !!editingSubscription}
        onClose={() => {
          setShowAddModal(false);
          setEditingSubscription(null);
        }}
        onSubscriptionAdded={() => {
          fetchSubscriptions();
          setShowAddModal(false);
          setEditingSubscription(null);
        }}
        subscription={editingSubscription}
      />
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
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
    marginTop: 16,
    color: COLORS.black,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  subscriptionContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  actionButtons: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    backgroundColor: COLORS.white,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
});