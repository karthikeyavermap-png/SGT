import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mobileTicketsApi } from '../../src/api';
import { useMobileAuth } from '../../src/auth-context';
import {
  TicketPriority,
  TicketStatus,
  UserRole,
  CreateCommentInput,
  UpdateTicketInput,
} from '@repo/shared';
import { Ionicons } from '@expo/vector-icons';

export default function MobileTicketDetailScreen() {
  const { id } = useLocalSearchParams() as { id: string };
  const { user } = useMobileAuth();
  const queryClient = useQueryClient();

  const [commentContent, setCommentContent] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isAgentOrAdmin = user?.role === UserRole.AGENT || user?.role === UserRole.ADMIN;

  const { data: ticket, isLoading, isError } = useQuery({
    queryKey: ['mobileTicket', id],
    queryFn: () => mobileTicketsApi.get(id),
  });

  const commentMutation = useMutation({
    mutationFn: (input: CreateCommentInput) => mobileTicketsApi.addComment(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobileTicket', id] });
      setCommentContent('');
      setIsInternal(false);
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to send comment');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: UpdateTicketInput) => mobileTicketsApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobileTicket', id] });
      queryClient.invalidateQueries({ queryKey: ['mobileTickets'] });
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to update ticket');
    },
  });

  const handleSendComment = () => {
    if (!commentContent.trim()) return;
    setErrorMsg(null);
    commentMutation.mutate({
      content: commentContent.trim(),
      isInternal,
    });
  };

  const handleStatusChange = (newStatus: TicketStatus) => {
    updateMutation.mutate({ status: newStatus });
  };

  if (isLoading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading ticket details...</Text>
      </View>
    );
  }

  if (isError || !ticket) {
    return (
      <View style={styles.centerBox}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>Unable to load ticket details</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Ticket Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.badgeRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{ticket.category}</Text>
            </View>
            <View style={[styles.priorityBadge, ticket.priority === TicketPriority.URGENT && styles.urgentBadge]}>
              <Text style={styles.priorityText}>{ticket.priority}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{ticket.status.replace('_', ' ')}</Text>
            </View>
          </View>

          <Text style={styles.title}>{ticket.title}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>By: {ticket.customer?.name}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>
              Assigned: {ticket.assignedAgent ? ticket.assignedAgent.name : 'None'}
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>DESCRIPTION</Text>
          <Text style={styles.description}>{ticket.description}</Text>
        </View>

        {/* Status Actions for Staff */}
        {isAgentOrAdmin && (
          <View style={styles.controlsCard}>
            <Text style={styles.sectionLabel}>UPDATE STATUS</Text>
            <View style={styles.statusBtnRow}>
              {[
                TicketStatus.OPEN,
                TicketStatus.IN_PROGRESS,
                TicketStatus.RESOLVED,
                TicketStatus.CLOSED,
              ].map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[styles.stBtn, ticket.status === st && styles.stBtnActive]}
                  onPress={() => handleStatusChange(st)}
                >
                  <Text style={[styles.stBtnText, ticket.status === st && styles.stBtnTextActive]}>
                    {st === TicketStatus.IN_PROGRESS ? 'ACTIVE' : st}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Conversation Stream */}
        <View style={styles.timelineCard}>
          <Text style={styles.sectionLabel}>
            CONVERSATION & ACTIVITY ({ticket.comments?.length || 0})
          </Text>

          <View style={styles.commentsList}>
            {ticket.comments && ticket.comments.length > 0 ? (
              ticket.comments.map((comment) => (
                <View
                  key={comment.id}
                  style={[
                    styles.commentBubble,
                    comment.isInternal && styles.internalBubble,
                  ]}
                >
                  <View style={styles.commentHeader}>
                    <Text style={styles.authorName}>{comment.author.name}</Text>
                    {comment.isInternal && (
                      <View style={styles.internalTag}>
                        <Text style={styles.internalTagText}>STAFF NOTE</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.commentBody}>{comment.content}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noCommentsText}>No activity recorded yet.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Comment Input Bar */}
      <View style={styles.inputBar}>
        {errorMsg && <Text style={styles.inputErrorText}>{errorMsg}</Text>}
        {isAgentOrAdmin && (
          <TouchableOpacity
            style={styles.internalToggle}
            onPress={() => setIsInternal(!isInternal)}
          >
            <Ionicons
              name={isInternal ? 'checkbox' : 'square-outline'}
              size={18}
              color={isInternal ? '#fbbf24' : '#64748b'}
            />
            <Text style={[styles.internalToggleText, isInternal && { color: '#fbbf24' }]}>
              Internal Note (Agents only)
            </Text>
          </TouchableOpacity>
        )}
        <View style={styles.composerRow}>
          <TextInput
            style={styles.composerInput}
            placeholder={isInternal ? 'Add private note...' : 'Reply to ticket...'}
            placeholderTextColor="#64748b"
            value={commentContent}
            onChangeText={setCommentContent}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !commentContent.trim() && styles.sendBtnDisabled]}
            disabled={!commentContent.trim() || commentMutation.isPending}
            onPress={handleSendComment}
          >
            {commentMutation.isPending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons name="send" size={18} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#020617',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 10,
    fontSize: 13,
  },
  errorText: {
    color: '#f87171',
    marginTop: 10,
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    color: '#a5b4fc',
    fontSize: 11,
    fontWeight: '700',
  },
  priorityBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  urgentBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  priorityText: {
    color: '#93c5fd',
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    lineHeight: 24,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
  },
  metaDot: {
    color: '#475569',
  },
  divider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginVertical: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: '#cbd5e1',
    lineHeight: 20,
  },
  controlsCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  statusBtnRow: {
    flexDirection: 'row',
    gap: 6,
  },
  stBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    alignItems: 'center',
  },
  stBtnActive: {
    backgroundColor: '#6366f1',
  },
  stBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
  },
  stBtnTextActive: {
    color: '#ffffff',
  },
  timelineCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  commentsList: {
    gap: 10,
  },
  commentBubble: {
    backgroundColor: '#020617',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  internalBubble: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  authorName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  internalTag: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  internalTagText: {
    color: '#fbbf24',
    fontSize: 9,
    fontWeight: '800',
  },
  commentBody: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
  noCommentsText: {
    textAlign: 'center',
    color: '#475569',
    fontSize: 12,
    paddingVertical: 12,
  },
  inputBar: {
    backgroundColor: '#090d16',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    padding: 12,
  },
  inputErrorText: {
    color: '#f87171',
    fontSize: 11,
    marginBottom: 6,
  },
  internalToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  internalToggleText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  composerInput: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 80,
    fontSize: 14,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#334155',
  },
});
