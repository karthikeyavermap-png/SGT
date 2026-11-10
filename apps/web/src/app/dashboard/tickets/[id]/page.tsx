'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import {
  TicketStatus,
  TicketPriority,
  UserRole,
  CreateCommentInput,
  UpdateTicketInput,
} from '@repo/shared';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Shield,
  MessageSquare,
  Lock,
  Send,
  AlertCircle,
  CheckCircle2,
  Tag,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default function TicketDetailPage() {
  const { id } = useParams() as { id: string };
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [commentContent, setCommentContent] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch Ticket Details
  const { data: ticket, isLoading, isError } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketsApi.get(id),
  });

  // Fetch Agents list (for assignment)
  const isAgentOrAdmin = user?.role === UserRole.AGENT || user?.role === UserRole.ADMIN;
  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => ticketsApi.getAgents(),
    enabled: isAgentOrAdmin,
  });

  // Mutation to add comment
  const addCommentMutation = useMutation({
    mutationFn: (input: CreateCommentInput) => ticketsApi.addComment(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      setCommentContent('');
      setIsInternal(false);
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to submit comment');
    },
  });

  // Mutation to update ticket status/priority/agent
  const updateTicketMutation = useMutation({
    mutationFn: (input: UpdateTicketInput) => ticketsApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticketStats'] });
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to update ticket');
    },
  });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    setErrorMsg(null);
    addCommentMutation.mutate({
      content: commentContent.trim(),
      isInternal,
    });
  };

  const handleStatusChange = (newStatus: TicketStatus) => {
    updateTicketMutation.mutate({ status: newStatus });
  };

  const handlePriorityChange = (newPriority: TicketPriority) => {
    updateTicketMutation.mutate({ priority: newPriority });
  };

  const handleAssigneeChange = (agentId: string) => {
    updateTicketMutation.mutate({
      assignedAgentId: agentId === 'UNASSIGNED' ? null : agentId,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-950/30 p-8 text-center text-red-300">
        <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
        <h3 className="mt-2 text-base font-semibold">Ticket not found or access denied</h3>
        <Link
          href="/dashboard"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-xs font-medium text-white hover:bg-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tickets Queue
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xs font-medium text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Ticket Queue
        </Link>
        <span className="text-xs text-slate-500 font-mono">ID: {ticket.id}</span>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-950/40 p-3.5 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Main Grid: Ticket Details (Left) + Control Sidebar (Right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Details & Conversation */}
        <div className="space-y-6 lg:col-span-2">
          {/* Ticket Header & Description Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="rounded-md bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">
                {ticket.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                Created {formatDate(ticket.createdAt)}
              </span>
            </div>

            <h1 className="text-xl font-bold text-white sm:text-2xl">{ticket.title}</h1>

            <div className="mt-4 border-t border-slate-800/80 pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Issue Description
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>
          </div>

          {/* Conversation Timeline */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
              <MessageSquare className="h-4 w-4 text-indigo-400" />
              Activity & Conversation ({ticket.comments?.length || 0})
            </h3>

            <div className="mt-6 space-y-4">
              {ticket.comments && ticket.comments.length > 0 ? (
                ticket.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`rounded-2xl border p-4.5 transition ${
                      comment.isInternal
                        ? 'border-amber-500/30 bg-amber-950/20 shadow-sm'
                        : 'border-slate-800 bg-slate-900/90'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-800/50 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/30 text-xs font-bold text-indigo-300">
                          {comment.author.name.charAt(0)}
                        </div>
                        <span className="text-xs font-semibold text-white">
                          {comment.author.name}
                        </span>
                        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                          {comment.author.role}
                        </span>
                        {comment.isInternal && (
                          <span className="flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                            <Lock className="h-3 w-3" />
                            INTERNAL NOTE
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-300 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-xs text-slate-500">
                  No comments yet. Send a response below.
                </p>
              )}
            </div>

            {/* Comment Composer */}
            <form onSubmit={handleCommentSubmit} className="mt-6 border-t border-slate-800 pt-5">
              <textarea
                rows={3}
                required
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder={
                  isInternal
                    ? 'Write internal staff note (visible to agents only)...'
                    : 'Write a response to the customer...'
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                {isAgentOrAdmin ? (
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-amber-300">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                    />
                    <Lock className="h-3.5 w-3.5" />
                    Internal Staff Note
                  </label>
                ) : <div />}

                <button
                  type="submit"
                  disabled={addCommentMutation.isPending || !commentContent.trim()}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  {addCommentMutation.isPending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Metadata & Status Controls */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ticket Controls
            </h3>

            {/* Status Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Status</label>
              {isAgentOrAdmin ? (
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-medium text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value={TicketStatus.OPEN}>OPEN</option>
                  <option value={TicketStatus.IN_PROGRESS}>IN PROGRESS</option>
                  <option value={TicketStatus.RESOLVED}>RESOLVED</option>
                  <option value={TicketStatus.CLOSED}>CLOSED</option>
                </select>
              ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs font-semibold text-amber-400">
                  {ticket.status.replace('_', ' ')}
                </div>
              )}
            </div>

            {/* Priority Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Priority</label>
              {isAgentOrAdmin ? (
                <select
                  value={ticket.priority}
                  onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-medium text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value={TicketPriority.LOW}>LOW</option>
                  <option value={TicketPriority.MEDIUM}>MEDIUM</option>
                  <option value={TicketPriority.HIGH}>HIGH</option>
                  <option value={TicketPriority.URGENT}>URGENT</option>
                </select>
              ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs font-semibold text-indigo-400">
                  {ticket.priority}
                </div>
              )}
            </div>

            {/* Agent Assignee */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Assignee</label>
              {isAgentOrAdmin ? (
                <select
                  value={ticket.assignedAgentId || 'UNASSIGNED'}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-medium text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="UNASSIGNED">-- Unassigned --</option>
                  {agents?.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} ({agent.role})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs font-medium text-slate-300">
                  {ticket.assignedAgent ? ticket.assignedAgent.name : 'Unassigned'}
                </div>
              )}
            </div>
          </div>

          {/* Customer Profile Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Customer Details
            </h3>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/20 text-sm font-bold text-emerald-400 border border-emerald-500/30">
                {ticket.customer?.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{ticket.customer?.name}</p>
                <p className="text-xs text-slate-400">{ticket.customer?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
