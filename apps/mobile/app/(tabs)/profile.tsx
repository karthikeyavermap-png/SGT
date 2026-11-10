import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useMobileAuth } from '../../src/auth-context';
import { useQuery } from '@tanstack/react-query';
import { mobileTicketsApi } from '../../src/api';
import { UserRole } from '@repo/shared';
import { Ionicons } from '@expo/vector-icons';

export default function MobileProfileScreen() {
  const { user, logout } = useMobileAuth();

  const { data: stats } = useQuery({
    queryKey: ['mobileTicketStats'],
    queryFn: () => mobileTicketsApi.getStats(),
  });

  if (!user) return null;

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return { bg: 'rgba(168, 85, 247, 0.2)', text: '#c084fc', border: '#a855f7' };
      case UserRole.AGENT:
        return { bg: 'rgba(59, 130, 246, 0.2)', text: '#60a5fa', border: '#3b82f6' };
      default:
        return { bg: 'rgba(16, 185, 129, 0.2)', text: '#34d399', border: '#10b981' };
    }
  };

  const roleStyle = getRoleBadgeStyle(user.role);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Card */}
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>

        <View style={[styles.roleBadge, { backgroundColor: roleStyle.bg, borderColor: roleStyle.border }]}>
          <Text style={[styles.roleText, { color: roleStyle.text }]}>{user.role}</Text>
        </View>
      </View>

      {/* Ticket Metrics Overview */}
      <View style={styles.statsCard}>
        <Text style={styles.sectionHeader}>SUPPORT OVERVIEW</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats?.total ?? 0}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#fbbf24' }]}>{stats?.open ?? 0}</Text>
            <Text style={styles.statLabel}>Open</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#818cf8' }]}>{stats?.inProgress ?? 0}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#34d399' }]}>{stats?.resolved ?? 0}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>
      </View>

      {/* Cross-Platform Details */}
      <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <Ionicons name="phone-portrait-outline" size={18} color="#6366f1" />
          <Text style={styles.infoTitle}>Secure Token Storage</Text>
        </View>
        <Text style={styles.infoDesc}>
          Access tokens and rotating refresh tokens are protected using Expo SecureStore on hardware keychain/keystore.
        </Text>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Ionicons name="log-out-outline" size={18} color="#ef4444" />
        <Text style={styles.logoutText}>Sign Out of PulseDesk</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderWidth: 2,
    borderColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userEmail: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statsCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  infoDesc: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 14,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    marginTop: 8,
  },
  logoutText: {
    color: '#f87171',
    fontSize: 14,
    fontWeight: '600',
  },
});

