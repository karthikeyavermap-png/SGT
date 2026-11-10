import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { mobileTicketsApi } from '../../src/api';
import { TicketPriority, TicketStatus, TicketResponse } from '@repo/shared';
import { Ionicons } from '@expo/vector-icons';

export default function MobileTicketsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: tickets, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['mobileTickets', statusFilter, search],
    queryFn: () =>
      mobileTicketsApi.list({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: search.trim() ? search.trim() : undefined,
      }),
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case TicketPriority.URGENT:
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: '#ef4444' };
      case TicketPriority.HIGH:
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: '#f59e0b' };
      case TicketPriority.MEDIUM:
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: '#3b82f6' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', border: '#64748b' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case TicketStatus.OPEN:
        return { bg: 'rgba(245, 158, 11, 0.2)', text: '#fbbf24' };
      case TicketStatus.IN_PROGRESS:
        return { bg: 'rgba(99, 102, 241, 0.2)', text: '#818cf8' };
      case TicketStatus.RESOLVED:
        return { bg: 'rgba(16, 185, 129, 0.2)', text: '#34d399' };
      default:
        return { bg: 'rgba(100, 116, 139, 0.2)', text: '#94a3b8' };
    }
  };

  const renderTicketItem = ({ item }: { item: TicketResponse }) => {
    const pColor = getPriorityColor(item.priority);
    const sColor = getStatusColor(item.status);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => router.push(`/ticket/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.badgeRow}>
            <View style={[styles.priorityBadge, { backgroundColor: pColor.bg, borderColor: pColor.border }]}>
              <Text style={[styles.priorityText, { color: pColor.text }]}>{item.priority}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: sColor.bg }]}>
              <Text style={[styles.statusText, { color: sColor.text }]}>
                {item.status.replace('_', ' ')}
              </Text>
            </View>
          </View>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>

        <Text style={styles.ticketTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <Text style={styles.ticketDesc} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.customerRow}>
            <Ionicons name="person-circle-outline" size={16} color="#64748b" />
            <Text style={styles.customerName}>{item.customer?.name || 'Customer'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#64748b" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={18} color="#64748b" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tickets by topic..."
          placeholderTextColor="#64748b"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <View style={styles.chipsRow}>
        {['ALL', TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED].map((st) => (
          <TouchableOpacity
            key={st}
            style={[styles.chip, statusFilter === st && styles.chipActive]}
            onPress={() => setStatusFilter(st)}
          >
            <Text style={[styles.chipText, statusFilter === st && styles.chipTextActive]}>
              {st === 'ALL' ? 'All' : st.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Ticket List */}
      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Fetching tickets...</Text>
        </View>
      ) : (
        <FlatList
          data={tickets || []}
          keyExtractor={(item) => item.id}
          renderItem={renderTicketItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#6366f1"
              colors={['#6366f1']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="document-text-outline" size={48} color="#334155" />
              <Text style={styles.emptyTitle}>No Tickets Found</Text>
              <Text style={styles.emptySubtitle}>
                No tickets match your filter criteria or search keyword.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
  },
  chipsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  chipActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  chipText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  categoryText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  ticketDesc: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 10,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customerName: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 10,
    fontSize: 13,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 240,
  },
});
