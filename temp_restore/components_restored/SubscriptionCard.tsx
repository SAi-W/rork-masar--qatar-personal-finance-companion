import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Subscription } from '@/types';
import BrutalCard from './BrutalCard';
import { COLORS } from '@/constants/colors';
import { formatCurrency, formatDate } from '@/utils/formatters';
import CategoryIcon from './CategoryIcon';

interface SubscriptionCardProps {
  subscription: Subscription;
  onPress?: () => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ 
  subscription, 
  onPress 
}) => {
  const daysUntilBilling = React.useMemo(() => {
    const today = new Date();
    const billingDate = new Date(subscription.nextBillingDate);
    const diffTime = billingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [subscription.nextBillingDate]);

  const getStatusColor = () => {
    switch (subscription.status) {
      case 'active':
        return COLORS.success;
      case 'canceled':
        return COLORS.error;
      case 'paused':
        return COLORS.gold;
      default:
        return COLORS.textSecondary;
    }
  };

  return (
    <BrutalCard 
      style={styles.card} 
      testID={`subscription-card-${subscription.id}`}
    >
      <View style={styles.header}>
        <View style={styles.serviceInfo}>
          <CategoryIcon category={subscription.category} />
          <View style={styles.serviceDetails}>
            <Text style={styles.serviceName}>{subscription.serviceName}</Text>
            <Text style={styles.billingCycle}>
              {formatCurrency(subscription.amount)} / {subscription.billingCycle}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{subscription.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.billingInfo}>
        <View style={styles.nextBillingContainer}>
          <Text style={styles.nextBillingLabel}>NEXT BILLING</Text>
          <Text style={styles.nextBillingDate}>
            {formatDate(subscription.nextBillingDate)}
          </Text>
        </View>
        
        <View style={styles.daysContainer}>
          <Text 
            style={[
              styles.daysNumber,
              daysUntilBilling <= 3 && styles.urgentDays
            ]}
          >
            {daysUntilBilling}
          </Text>
          <Text style={styles.daysLabel}>DAYS</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        {subscription.autoDeduct && (
          <View style={styles.autoBadge}>
            <Text style={styles.autoText}>AUTO-DEDUCT</Text>
          </View>
        )}
      </View>
    </BrutalCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceDetails: {
    marginLeft: 12,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  billingCycle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.white,
  },
  billingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  nextBillingContainer: {},
  nextBillingLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  nextBillingDate: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  daysContainer: {
    alignItems: 'center',
  },
  daysNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  urgentDays: {
    color: COLORS.error,
  },
  daysLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  autoBadge: {
    backgroundColor: COLORS.maroon,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: COLORS.black,
  },
  autoText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.white,
  },
});

export default SubscriptionCard;