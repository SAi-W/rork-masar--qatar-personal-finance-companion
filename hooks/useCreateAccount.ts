import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { trpc } from '@/lib/trpc';

export function useCreateAccount() {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: trpc.accounts.create.mutate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts.list'] });
      Alert.alert('Success', 'Account added successfully');
    },
    onError: (e: any) => Alert.alert('Error', e?.message ?? 'Could not add account'),
  });
}
