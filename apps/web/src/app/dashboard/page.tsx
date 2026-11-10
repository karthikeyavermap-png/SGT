'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import {
  TicketStatus,
  TicketPriority,
  TICKET_CATEGORIES,
  CreateTicketInput,
  UserRole,
} from '@repo/shared';
import {
  Plus,
  Search,
  Filter,
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  User,
  ArrowUpRight,
  X,
  FileText,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Ticket Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<string>('General');
  const [newPriority, setNewPriority] = useState<TicketPriority>(TicketPriority.MEDIUM);
  const [createError, setCreateError] = useState<string | null>(null);

  // Stats Query
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['ticketStats'],
    queryFn: () => ticketsApi.getStats(),
  });

  // Tickets List Query
  const { data: tickets, isLoading: isTicketsLoading, refetch } = useQuery({
    queryKey: ['tickets', statusFilter, priorityFilter, search],
    queryFn: () =>
      ticketsApi.list({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
        search: search.trim() ? search.trim() : undefined,
      }),
  });

  // Create Ticket Mutation
  const createTicketMutation = useMutation({
    mutationFn: (input: CreateTicketInput) => ticketsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticketStats'] });
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewCategory('General');
      setNewPriority(TicketPriority.MEDIUM);
      setCreateError(null);
    },
    onError: (err: any) => {
      setCreateError(err.message || 'Failed to create ticket');
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    createTicketMutation.mutate({
      title: newTitle,
      description: newDescription,
      category: newCategory,
      priority: newPriority,
    });
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case TicketPriority.URGENT:
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case TicketPriority.HIGH:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case TicketPriority.MEDIUM:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case TicketPriority.LOW:
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case TicketStatus.OPEN:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case TicketStatus.IN_PROGRESS:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case TicketStatus.RESOLVED:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case TicketStatus.CLOSED:
        return 'bg-slate-700/40 text-slate-400 border-slate-700';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Tickets</span>
            <FileText className="h-4 w-4 text-slate-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-white">
            {isStatsLoading ? '...' : stats?.total ?? 0}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-400">Open Tickets</span>
            <AlertCircle className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-300">
            {isStatsLoading ? '...' : stats?.open ?? 0}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-indigo-400">In Progress</span>
            <Clock className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-indigo-300">
            {isStatsLoading ? '...' : stats?.inProgress ?? 0}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-400">Resolved</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-300">
            {isStatsLoading ? '...' : stats?.resolved ?? 0}
          </p>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-red-400">Urgent</span>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-red-400">
            {isStatsLoading ? '...' : stats?.urgent ?? 0}
          </p>
        </div>
      </div>

      {/* Control Bar: Filters, Search & New Ticket CTA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets by subject, keyword..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">Status: All</option>
            <option value={TicketStatus.OPEN}>Open</option>
            <option value={TicketStatus.IN_PROGRESS}>In Progress</option>
            <option value={TicketStatus.RESOLVED}>Resolved</option>
            <option value={TicketStatus.CLOSED}>Closed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">Priority: All</option>
            <option value={TicketPriority.LOW}>Low</option>
            <option value={TicketPriority.MEDIUM}>Medium</option>
            <option value={TicketPriority.HIGH}>High</option>
            <option value={TicketPriority.URGENT}>Urgent</option>
          </select>
        </div>

        {/* Create Ticket Button */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
        >
          <Plus className="h-4 w-4" />
          Create Ticket
        </button>
      </div>

      {/* Ticket List Table / Cards */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        {isTicketsLoading ? (
          <div className="space-y-4 p-8 text-center text-slate-400">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            <p className="text-sm">Loading tickets from database...</p>
          </div>
        ) : !tickets || tickets.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-slate-600" />
            <h3 className="mt-4 text-base font-semibold text-white">No tickets found</h3>
            <p className="mt-1 text-sm text-slate-400">
              {search || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
                ? 'Try adjusting your filters or search keywords.'
                : 'Get started by creating your first customer service ticket.'}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" />
              Submit Ticket
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/dashboard/tickets/${ticket.id}`}
                className="group flex flex-col justify-between gap-4 p-5 transition hover:bg-slate-800/40 sm:flex-row sm:items-center"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-800/60 text-slate-300 group-hover:border-indigo-500/50 group-hover:text-indigo-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-400">
                        {ticket.category}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${getPriorityBadge(
                          ticket.priority
                        )}`}
                      >
                        {ticket.priority}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${getStatusBadge(
                          ticket.status
                        )}`}
                      >
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="mt-1.5 text-base font-semibold text-white group-hover:text-indigo-300">
                      {ticket.title}
                    </h4>

                    <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                      {ticket.description}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {ticket.customer?.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(ticket.createdAt)}
                      </span>
                      {ticket._count?.comments !== undefined && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {ticket._count.comments} {ticket._count.comments === 1 ? 'comment' : 'comments'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <p className="text-[11px] font-medium text-slate-400">Assigned Agent</p>
                    <p className="text-xs font-semibold text-slate-200">
                      {ticket.assignedAgent ? ticket.assignedAgent.name : 'Unassigned'}
                    </p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-slate-600 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-indigo-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Create New Support Ticket</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {createError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-950/40 p-3 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-300">
                  Subject / Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Brief summary of the issue"
                  className="mt-1 block w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-300">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {TICKET_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-300">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TicketPriority)}
                    className="mt-1 block w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value={TicketPriority.LOW}>Low</option>
                    <option value={TicketPriority.MEDIUM}>Medium</option>
                    <option value={TicketPriority.HIGH}>High</option>
                    <option value={TicketPriority.URGENT}>Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-300">
                  Description & Context
                </label>
                <textarea
                  required
                  rows={4}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Detailed description of the problem, steps to reproduce, or affected service..."
                  className="mt-1 block w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTicketMutation.isPending}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-50"
                >
                  {createTicketMutation.isPending ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

