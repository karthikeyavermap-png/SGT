import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { mobileTicketsApi } from '../../src/api';
import {
  TicketPriority,
  TICKET_CATEGORIES,
  CreateTicketInput,
} from '@repo/shared';
import { Ionicons } from '@expo/vector-icons';

export default function MobileCreateTicketScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('General');
  const [priority, setPriority] = useState<TicketPriority>(TicketPriority.MEDIUM);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (input: CreateTicketInput) => mobileTicketsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobileTickets'] });
      setTitle('');
      setDescription('');
      setCategory('General');
      setPriority(TicketPriority.MEDIUM);
      setError(null);
      router.push('/(tabs)');
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to submit ticket');
    },
  });

  const handleSubmit = () => {
    if (title.trim().length < 3) {
      setError('Title must be at least 3 characters long');
      return;
    }
    if (description.trim().length < 10) {
      setError('Description must be at least 10 characters long');
      return;
    }

    setError(null);
    createMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Create Support Ticket</Text>
      <Text style={styles.pageSubtitle}>
        Submit a request to our engineering and support specialists.
      </Text>

      {error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={18} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Title */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>TICKET SUBJECT / TITLE</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Cannot access invoice download..."
          placeholderTextColor="#64748b"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      {/* Category Selection */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>CATEGORY</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalChips}>
          {TICKET_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.choiceChip, category === cat && styles.choiceChipActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.choiceChipText, category === cat && styles.choiceChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Priority Selection */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>PRIORITY</Text>
        <View style={styles.priorityRow}>
          {[TicketPriority.LOW, TicketPriority.MEDIUM, TicketPriority.HIGH, TicketPriority.URGENT].map(
            (p) => (
              <TouchableOpacity
                key={p}
                style={[styles.priorityBtn, priority === p && styles.priorityBtnActive]}
                onPress={() => setPriority(p)}
              >
                <Text
                  style={[
                    styles.priorityBtnText,
                    priority === p && styles.priorityBtnTextActive,
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>

      {/* Description */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>DETAILED DESCRIPTION</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Please describe what happened, steps to reproduce, or any error messages..."
          placeholderTextColor="#64748b"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleSubmit}
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitBtnText}>Submit Ticket</Text>
        )}
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
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 8,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
    flex: 1,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    color: '#ffffff',
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  horizontalChips: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  choiceChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    marginRight: 8,
  },
  choiceChipActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  choiceChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  choiceChipTextActive: {
    color: '#ffffff',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
  },
  priorityBtnActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  priorityBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
  },
  priorityBtnTextActive: {
    color: '#ffffff',
  },
  submitBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#6366f1',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
