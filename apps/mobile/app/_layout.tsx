import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MobileAuthProvider, useMobileAuth } from '../src/auth-context';
import { View, ActivityIndicator } from 'react-native';

const queryClient = new QueryClient();

function RootNavigation() {
  const { user, isLoading } = useMobileAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#f8fafc',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: '#020617' },
        }}
      >
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="ticket/[id]"
          options={{
            title: 'Ticket Details',
            headerBackTitle: 'Queue',
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <MobileAuthProvider>
        <RootNavigation />
      </MobileAuthProvider>
    </QueryClientProvider>
  );
}
