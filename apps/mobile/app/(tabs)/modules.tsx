import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMobileAuth } from '../../src/auth-context';

export default function MobileModulesScreen() {
  const { user } = useMobileAuth();
  const [activeSegment, setActiveSegment] = useState<'trips' | 'yard' | 'accounts'>('trips');
  const [trips, setTrips] = useState([
    {
      id: '1',
      tripNumber: 'TRIP-2026-8801',
      origin: 'Yard Bay A-02 (SGT Hub)',
      destination: 'JNPT Port Terminal Gate 3',
      vehicle: 'KA-04-AK-8119 (Multi-Axle 42T)',
      driver: 'Manjunath Gowda',
      cargo: 'Cold Rolled Steel (28.5 MT)',
      status: 'IN_TRANSIT',
    },
    {
      id: '2',
      tripNumber: 'TRIP-2026-8802',
      origin: 'Rail Siding Track 2',
      destination: 'Bulk Minerals Staging Yard',
      vehicle: 'OD-05-BX-2204 (Kalmar ITV 35T)',
      driver: 'Bikash Mahapatra',
      cargo: 'Pellets & Clinker (32.0 MT)',
      status: 'DELIVERED',
    },
  ]);

  const handleDeliverTrip = (tripId: string) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, status: 'DELIVERED' } : t))
    );
    Alert.alert('Trip Delivered', 'Waybill sign-off recorded and vehicle marked available.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Pill */}
      <View style={styles.roleCard}>
        <View style={styles.roleHeader}>
          <Ionicons name="shield-checkmark" size={20} color="#6366f1" />
          <Text style={styles.roleTitle}>{user?.name || 'Field Operator'}</Text>
        </View>
        <Text style={styles.roleSubtitle}>Active Role: {user?.role || 'DRIVER / DISPATCHER'}</Text>
      </View>

      {/* Segment Switcher */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          onPress={() => setActiveSegment('trips')}
          style={[styles.segmentBtn, activeSegment === 'trips' && styles.segmentBtnActive]}
        >
          <Text style={[styles.segmentText, activeSegment === 'trips' && styles.segmentTextActive]}>
            Fleet Trips
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveSegment('yard')}
          style={[styles.segmentBtn, activeSegment === 'yard' && styles.segmentBtnActive]}
        >
          <Text style={[styles.segmentText, activeSegment === 'yard' && styles.segmentTextActive]}>
            Yard Telemetry
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveSegment('accounts')}
          style={[styles.segmentBtn, activeSegment === 'accounts' && styles.segmentBtnActive]}
        >
          <Text style={[styles.segmentText, activeSegment === 'accounts' && styles.segmentTextActive]}>
            Invoices &amp; Tax
          </Text>
        </TouchableOpacity>
      </View>

      {/* Segment 1: Trips */}
      {activeSegment === 'trips' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Commercial Trips &amp; Dispatches</Text>
          {trips.map((t) => (
            <View key={t.id} style={styles.tripCard}>
              <View style={styles.tripHeader}>
                <Text style={styles.tripNumber}>{t.tripNumber}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    t.status === 'DELIVERED' ? styles.badgeDelivered : styles.badgeTransit,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      t.status === 'DELIVERED' ? styles.textDelivered : styles.textTransit,
                    ]}
                  >
                    {t.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.routeText}>
                {t.origin} → {t.destination}
              </Text>
              <Text style={styles.detailText}>Vehicle: {t.vehicle}</Text>
              <Text style={styles.detailText}>Cargo: {t.cargo}</Text>

              {t.status === 'IN_TRANSIT' && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleDeliverTrip(t.id)}
                >
                  <Ionicons name="checkmark-done" size={16} color="#ffffff" />
                  <Text style={styles.actionBtnText}>Confirm Delivery at Dock</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Segment 2: Yard */}
      {activeSegment === 'yard' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yard Machinery Diagnostics &amp; Oil</Text>
          <View style={styles.diagCard}>
            <View style={styles.diagHeader}>
              <Text style={styles.equipCode}>RMG-01 (Rail Crane)</Text>
              <Text style={styles.critBadge}>CRITICAL</Text>
            </View>
            <Text style={styles.diagDesc}>
              Hydraulic pump pressure drop (165 Bar). Oil temp 84°C.
            </Text>
          </View>

          <View style={styles.diagCard}>
            <View style={styles.diagHeader}>
              <Text style={styles.equipCode}>RS-02 (Reach Stacker)</Text>
              <Text style={styles.warnBadge}>MEDIUM</Text>
            </View>
            <Text style={styles.diagDesc}>
              Spreader twistlock solenoid resistance flicker (14.2Ω).
            </Text>
          </View>
        </View>
      )}

      {/* Segment 3: Accounts */}
      {activeSegment === 'accounts' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Commercial Invoices &amp; GST</Text>
          <View style={styles.diagCard}>
            <View style={styles.diagHeader}>
              <Text style={styles.equipCode}>INV-GST-2026-1049</Text>
              <Text style={styles.paidBadge}>PAID</Text>
            </View>
            <Text style={styles.diagDesc}>Tata Steel Ltd. • Gross: ₹7,43,400 (18% GST)</Text>
          </View>

          <View style={styles.diagCard}>
            <View style={styles.diagHeader}>
              <Text style={styles.equipCode}>INV-GST-2026-1050</Text>
              <Text style={styles.warnBadge}>PARTIAL</Text>
            </View>
            <Text style={styles.diagDesc}>JSW Infrastructure • Gross: ₹4,95,600</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  roleCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 16,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  roleSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: '#6366f1',
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  segmentTextActive: {
    color: '#ffffff',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e2e8f0',
    marginBottom: 4,
  },
  tripCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#f59e0b',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeTransit: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  badgeDelivered: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  textTransit: {
    color: '#f59e0b',
  },
  textDelivered: {
    color: '#10b981',
  },
  routeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 10,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  diagCard: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  diagHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  equipCode: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  critBadge: {
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
    color: '#f43f5e',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  warnBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    color: '#f59e0b',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  paidBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    color: '#10b981',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  diagDesc: {
    fontSize: 12,
    color: '#94a3b8',
  },
});
