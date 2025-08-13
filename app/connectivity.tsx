import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { API } from '@/lib/api';
import { trpcClient } from '@/lib/trpc';
import { useRouter } from 'expo-router';
import { saveConnectivityOk } from '@/lib/storage';

export default function Connectivity() {
  const [health, setHealth] = useState<'ok'|'fail'|'pending'>('pending');
  const [rpc, setRpc] = useState<'ok'|'fail'|'pending'>('pending');
  const router = useRouter();

  const testHealth = useCallback(async () => {
    try {
      console.log('Testing health endpoint:', `${API}/health`);
      const r = await fetch(`${API}/health`, {
        mode: 'cors', 
        credentials: 'omit',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      console.log('Health response:', r.status, r.ok);
      setHealth(r.ok ? 'ok' : 'fail');
    } catch (error) { 
      console.log('Health error:', error);
      setHealth('fail'); 
    }
  }, []);
  
  const testRpc = useCallback(async () => {
    try {
      const result = await trpcClient.public.ping.query();
      setRpc(result?.ok ? 'ok' : 'ok');
    } catch (error) { 
      console.log('tRPC ping error:', error);
      setRpc('fail'); 
    }
  }, []);

  useEffect(() => { 
    testHealth(); 
  }, [testHealth]);
  
  useEffect(() => { 
    if (health === 'ok') testRpc(); 
  }, [health, testRpc]);

  const allOk = health === 'ok' && rpc === 'ok';

  const handleRetest = () => {
    setHealth('pending');
    setRpc('pending');
    testHealth();
  };

  const handleContinue = async () => {
    console.log('✅ Both Health and tRPC are ok, saving connectivity status');
    await saveConnectivityOk();
    console.log('🎯 Redirecting to /onboarding');
    router.replace('/auth/intro');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connectivity Check</Text>
      <Text style={styles.apiBase}>API: {API}</Text>

      <View style={styles.testContainer}>
        <View style={styles.testRow}>
          <Text style={styles.testLabel}>Health (/api/health):</Text>
          <Text style={[styles.testStatus, health === 'ok' && styles.statusOk, health === 'fail' && styles.statusFail]}>
            {health}
          </Text>
          {health === 'pending' && <ActivityIndicator size="small" color="#8B0000" />}
        </View>

        <View style={styles.testRow}>
          <Text style={styles.testLabel}>tRPC (/api/trpc/public.ping):</Text>
          <Text style={[styles.testStatus, rpc === 'ok' && styles.statusOk, rpc === 'fail' && styles.statusFail]}>
            {rpc}
          </Text>
          {rpc === 'pending' && <ActivityIndicator size="small" color="#8B0000" />}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.retestButton}
          onPress={handleRetest}
        >
          <Text style={styles.buttonText}>Retest</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.continueButton, !allOk && styles.disabledButton]}
          onPress={handleContinue}
          disabled={!allOk}
        >
          <Text style={styles.buttonText}>Continue to Onboarding</Text>
        </TouchableOpacity>
      </View>

      {!allOk && (
        <Text style={styles.errorText}>
          If this never turns green, the app cannot reach the backend. The logger in backend/hono.ts should show requests to /api/health and /api/trpc/public.ping.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  apiBase: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 30,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  testContainer: {
    marginBottom: 40,
  },
  testRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: '#000000',
  },
  testLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  testStatus: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
    minWidth: 60,
    textAlign: 'right',
  },
  statusOk: {
    color: '#22c55e',
  },
  statusFail: {
    color: '#ef4444',
  },
  buttonContainer: {
    gap: 16,
  },
  retestButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#000000',
  },
  continueButton: {
    backgroundColor: '#22c55e',
    padding: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#000000',
  },
  disabledButton: {
    backgroundColor: '#666666',
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorText: {
    marginTop: 20,
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
    lineHeight: 20,
  },
});