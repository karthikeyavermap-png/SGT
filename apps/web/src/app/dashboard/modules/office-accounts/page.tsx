'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Receipt,
  CreditCard,
  TrendingDown,
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileSpreadsheet,
  Coins,
  PlusCircle,
  X,
} from 'lucide-react';
import {
  AccountInvoice,
  PaymentCollection,
  AccountExpense,
  PurchaseSaleOrder,
  getAccountInvoices,
  getPaymentCollections,
  getAccountExpenses,
  getPurchaseSaleOrders,
  createAccountInvoice,
  createPaymentCollection,
  createAccountExpense,
  createPurchaseSaleOrder,
} from '@/lib/modules-api';

export default function OfficeAccountsModulePage() {
  const [activeTab, setActiveTab] = useState<'invoices' | 'collections' | 'expenses' | 'orders'>('invoices');
  const [invoices, setInvoices] = useState<AccountInvoice[]>([]);
  const [collections, setCollections] = useState<PaymentCollection[]>([]);
  const [expenses, setExpenses] = useState<AccountExpense[]>([]);
  const [orders, setOrders] = useState<PurchaseSaleOrder[]>([]);

  // Modals
  const [modalType, setModalType] = useState<'invoice' | 'collection' | 'expense' | 'order' | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Forms
  const [invoiceForm, setInvoiceForm] = useState({
    customerName: '',
    customerGstin: '27AAACT2727Q1ZW',
    invoiceType: 'GST' as const,
    taxableAmount: 250000,
    dueDate: '2026-12-31',
  });

  const [colForm, setColForm] = useState({
    invoiceNumber: 'INV-GST-2026-1050',
    customerName: 'JSW Infrastructure Ltd.',
    amountReceived: 245600,
    paymentMode: 'RTGS' as const,
    transactionRef: `UTR-${Math.floor(1000000 + Math.random() * 9000000)}`,
    tdsDeducted: 4912,
  });

  const [expForm, setExpForm] = useState({
    category: 'DIESEL_FUEL' as const,
    description: 'Bulk diesel replenishment',
    amount: 75000,
    payeeName: 'Indian Oil Depot',
    paymentMode: 'BANK_TRANSFER' as const,
  });

  const [orderForm, setOrderForm] = useState({
    orderType: 'SALE' as const,
    counterpartyName: 'Tata Steel Ltd.',
    itemOrCommodity: 'Rake Loading Services',
    quantity: 1200,
    unitRate: 180,
  });

  useEffect(() => {
    async function loadData() {
      const [inv, col, exp, ord] = await Promise.all([
        getAccountInvoices(),
        getPaymentCollections(),
        getAccountExpenses(),
        getPurchaseSaleOrders(),
      ]);
      setInvoices(inv);
      setCollections(col);
      setExpenses(exp);
      setOrders(ord);
    }
    loadData();
  }, []);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const res = await createAccountInvoice(invoiceForm);
      if (res) {
        setInvoices([res, ...invoices]);
        setModalType(null);
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleCreateCol = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const res = await createPaymentCollection(colForm);
      if (res) {
        setCollections([res, ...collections]);
        setModalType(null);
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleCreateExp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const res = await createAccountExpense(expForm);
      if (res) {
        setExpenses([res, ...expenses]);
        setModalType(null);
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const res = await createPurchaseSaleOrder(orderForm);
      if (res) {
        setOrders([res, ...orders]);
        setModalType(null);
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/modules"
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Receipt className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-white">Office &amp; Accounts Module</h1>
            <span className="rounded-full bg-blue-500/20 border border-blue-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-blue-300">
              AE_Mod
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400 pl-8">
            Manage GST and Non-GST commercial invoices, inbound payment collections, operational expenses, and procurement purchase/sales orders.
          </p>
        </div>

        {/* Action Button depending on Tab */}
        <div>
          {activeTab === 'invoices' && (
            <button
              onClick={() => setModalType('invoice')}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-500 shadow-md shadow-blue-600/20 active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              Generate Tax Invoice
            </button>
          )}
          {activeTab === 'collections' && (
            <button
              onClick={() => setModalType('collection')}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-500 shadow-md shadow-blue-600/20 active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              Record Inward RTGS
            </button>
          )}
          {activeTab === 'expenses' && (
            <button
              onClick={() => setModalType('expense')}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-500 shadow-md shadow-blue-600/20 active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              Disburse Expense
            </button>
          )}
          {activeTab === 'orders' && (
            <button
              onClick={() => setModalType('order')}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-500 shadow-md shadow-blue-600/20 active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              New Order Contract
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
            activeTab === 'invoices'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          Invoices GST &amp; Non-GST ({invoices.length})
        </button>

        <button
          onClick={() => setActiveTab('collections')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
            activeTab === 'collections'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          Collections &amp; Inward RTGS ({collections.length})
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
            activeTab === 'expenses'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingDown className="h-4 w-4" />
          Office &amp; Branch Expenses ({expenses.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
            activeTab === 'orders'
              ? 'border-blue-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          Purchases &amp; Sales ({orders.length})
        </button>
      </div>

      {/* Tab 1: Invoices */}
      {activeTab === 'invoices' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Commercial Tax Invoices (GST &amp; Non-GST)</h3>
              <p className="text-xs text-slate-400">Cargo handling, warehousing tariffs, and statutory tax breakdown</p>
            </div>
            <span className="text-xs font-bold text-emerald-400">
              Total Invoiced: ₹{invoices.reduce((acc, curr) => acc + curr.grossAmount, 0).toLocaleString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Invoice Number</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">GSTIN</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Taxable Amount</th>
                  <th className="pb-3 font-semibold">CGST + SGST (18%)</th>
                  <th className="pb-3 font-semibold">Gross Total</th>
                  <th className="pb-3 font-semibold">Due Date</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {invoices.map((inv) => (
                  <tr key={inv.invoiceNumber} className="hover:bg-slate-800/30">
                    <td className="py-3 font-mono font-bold text-blue-400">{inv.invoiceNumber}</td>
                    <td className="py-3 font-semibold text-white">{inv.customerName}</td>
                    <td className="py-3 font-mono text-[11px] text-slate-400">{inv.customerGstin || 'Unregistered'}</td>
                    <td className="py-3">
                      <span className="rounded bg-slate-800 border border-slate-700 px-1.5 py-0.5 text-[10px] font-bold text-slate-300">
                        {inv.invoiceType}
                      </span>
                    </td>
                    <td className="py-3 text-slate-200">₹{inv.taxableAmount.toLocaleString()}</td>
                    <td className="py-3 font-mono text-cyan-300">₹{inv.totalTaxAmount.toLocaleString()}</td>
                    <td className="py-3 font-bold text-emerald-400">₹{inv.grossAmount.toLocaleString()}</td>
                    <td className="py-3 text-slate-400">{inv.dueDate}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                          inv.paymentStatus === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : inv.paymentStatus === 'PARTIALLY_PAID'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {inv.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Collections */}
      {activeTab === 'collections' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Inward Payment Collections &amp; Remittances</h3>
              <p className="text-xs text-slate-400">RTGS, NEFT, Bank UTR reconciliation, and TDS deductor receipts</p>
            </div>
            <span className="text-xs font-bold text-indigo-400">
              Total Realized: ₹{collections.reduce((acc, curr) => acc + curr.amountReceived, 0).toLocaleString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Receipt #</th>
                  <th className="pb-3 font-semibold">Invoice Ref</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Payment Mode</th>
                  <th className="pb-3 font-semibold">Bank UTR / Transaction Ref</th>
                  <th className="pb-3 font-semibold">TDS Deducted</th>
                  <th className="pb-3 font-semibold">Amount Received</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {collections.map((c) => (
                  <tr key={c.collectionNumber} className="hover:bg-slate-800/30">
                    <td className="py-3 font-mono font-bold text-indigo-400">{c.collectionNumber}</td>
                    <td className="py-3 font-mono text-blue-300">{c.invoiceNumber}</td>
                    <td className="py-3 font-semibold text-white">{c.customerName}</td>
                    <td className="py-3 font-mono text-amber-400">{c.paymentMode}</td>
                    <td className="py-3 font-mono text-slate-400 text-[11px]">{c.transactionRef}</td>
                    <td className="py-3 font-mono text-rose-400">₹{c.tdsDeducted.toLocaleString()}</td>
                    <td className="py-3 font-bold text-emerald-400">₹{c.amountReceived.toLocaleString()}</td>
                    <td className="py-3 text-slate-400">{c.paymentDate}</td>
                    <td className="py-3 text-slate-300">{c.recordedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Expenses */}
      {activeTab === 'expenses' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Office &amp; Operational Branch Expenses</h3>
              <p className="text-xs text-slate-400">High-tension power utilities, diesel bunkering, terminal security</p>
            </div>
            <span className="text-xs font-bold text-rose-400">
              Total Disbursed: ₹{expenses.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Expense Voucher</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold">Payee</th>
                  <th className="pb-3 font-semibold">Payment Mode</th>
                  <th className="pb-3 font-semibold">Disbursed Amount</th>
                  <th className="pb-3 font-semibold">Approved By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {expenses.map((e) => (
                  <tr key={e.expenseNumber} className="hover:bg-slate-800/30">
                    <td className="py-3 font-mono font-bold text-amber-400">{e.expenseNumber}</td>
                    <td className="py-3 font-mono text-cyan-300">{e.category}</td>
                    <td className="py-3 text-slate-200">{e.description}</td>
                    <td className="py-3 font-semibold text-white">{e.payeeName}</td>
                    <td className="py-3 font-mono text-slate-400">{e.paymentMode}</td>
                    <td className="py-3 font-bold text-rose-400">₹{e.amount.toLocaleString()}</td>
                    <td className="py-3 text-slate-300">{e.approvedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Purchases & Sales */}
      {activeTab === 'orders' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Purchases &amp; Sales Contracts Ledger</h3>
              <p className="text-xs text-slate-400">Diesel supply procurement contracts &amp; client service sales</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Contract #</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Counterparty</th>
                  <th className="pb-3 font-semibold">Item / Commodity</th>
                  <th className="pb-3 font-semibold">Quantity</th>
                  <th className="pb-3 font-semibold">Unit Rate</th>
                  <th className="pb-3 font-semibold">Total Contract Value</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.map((o) => (
                  <tr key={o.orderNumber} className="hover:bg-slate-800/30">
                    <td className="py-3 font-mono font-bold text-indigo-400">{o.orderNumber}</td>
                    <td className="py-3">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          o.orderType === 'SALE'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {o.orderType}
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-white">{o.counterpartyName}</td>
                    <td className="py-3 text-slate-300">{o.itemOrCommodity}</td>
                    <td className="py-3 text-slate-300">{o.quantity.toLocaleString()} Units</td>
                    <td className="py-3 text-slate-400">₹{o.unitRate}</td>
                    <td className="py-3 font-bold text-emerald-400">₹{o.totalAmount.toLocaleString()}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white">
                {modalType === 'invoice' && 'Generate Commercial Tax Invoice'}
                {modalType === 'collection' && 'Record Inward RTGS / Payment'}
                {modalType === 'expense' && 'Disburse Operational Expense'}
                {modalType === 'order' && 'Create Purchase / Sale Order'}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {modalType === 'invoice' && (
              <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={invoiceForm.customerName}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, customerName: e.target.value })}
                    placeholder="e.g. UltraTech Cement Ltd."
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Customer GSTIN</label>
                    <input
                      type="text"
                      value={invoiceForm.customerGstin}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, customerGstin: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Invoice Type</label>
                    <select
                      value={invoiceForm.invoiceType}
                      onChange={(e: any) => setInvoiceForm({ ...invoiceForm, invoiceType: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    >
                      <option value="GST">GST (18% Cargo Handling)</option>
                      <option value="NON_GST">NON_GST (Exempted Trust)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Taxable Amount (INR)</label>
                    <input
                      type="number"
                      required
                      value={invoiceForm.taxableAmount}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, taxableAmount: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Due Date</label>
                    <input
                      type="date"
                      required
                      value={invoiceForm.dueDate}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full rounded-xl bg-blue-600 py-2.5 font-bold text-white transition hover:bg-blue-500 disabled:opacity-50"
                >
                  {formSubmitting ? 'Generating...' : 'Generate & Issue Tax Invoice'}
                </button>
              </form>
            )}

            {modalType === 'collection' && (
              <form onSubmit={handleCreateCol} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Invoice Number Ref</label>
                    <input
                      type="text"
                      required
                      value={colForm.invoiceNumber}
                      onChange={(e) => setColForm({ ...colForm, invoiceNumber: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Payment Mode</label>
                    <select
                      value={colForm.paymentMode}
                      onChange={(e: any) => setColForm({ ...colForm, paymentMode: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    >
                      <option value="RTGS">RTGS</option>
                      <option value="NEFT">NEFT</option>
                      <option value="CHEQUE">CHEQUE</option>
                      <option value="UPI">UPI</option>
                      <option value="CASH">CASH</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={colForm.customerName}
                    onChange={(e) => setColForm({ ...colForm, customerName: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Amount Received (INR)</label>
                    <input
                      type="number"
                      required
                      value={colForm.amountReceived}
                      onChange={(e) => setColForm({ ...colForm, amountReceived: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">TDS Deducted (INR)</label>
                    <input
                      type="number"
                      value={colForm.tdsDeducted}
                      onChange={(e) => setColForm({ ...colForm, tdsDeducted: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Bank UTR Transaction Ref</label>
                  <input
                    type="text"
                    required
                    value={colForm.transactionRef}
                    onChange={(e) => setColForm({ ...colForm, transactionRef: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full rounded-xl bg-blue-600 py-2.5 font-bold text-white transition hover:bg-blue-500 disabled:opacity-50"
                >
                  {formSubmitting ? 'Recording...' : 'Record Payment Receipt'}
                </button>
              </form>
            )}

            {modalType === 'expense' && (
              <form onSubmit={handleCreateExp} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Expense Description</label>
                  <input
                    type="text"
                    required
                    value={expForm.description}
                    onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                    placeholder="e.g. Substation backup diesel"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Category</label>
                    <select
                      value={expForm.category}
                      onChange={(e: any) => setExpForm({ ...expForm, category: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    >
                      <option value="DIESEL_FUEL">DIESEL_FUEL</option>
                      <option value="ELECTRICITY_POWER">ELECTRICITY_POWER</option>
                      <option value="YARD_LEASE">YARD_LEASE</option>
                      <option value="SECURITY_SERVICES">SECURITY_SERVICES</option>
                      <option value="MUNICIPAL_TAX">MUNICIPAL_TAX</option>
                      <option value="OFFICE_ADMIN">OFFICE_ADMIN</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Amount (INR)</label>
                    <input
                      type="number"
                      required
                      value={expForm.amount}
                      onChange={(e) => setExpForm({ ...expForm, amount: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Payee / Vendor Name</label>
                  <input
                    type="text"
                    required
                    value={expForm.payeeName}
                    onChange={(e) => setExpForm({ ...expForm, payeeName: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full rounded-xl bg-blue-600 py-2.5 font-bold text-white transition hover:bg-blue-500 disabled:opacity-50"
                >
                  {formSubmitting ? 'Disbursing...' : 'Disburse Voucher'}
                </button>
              </form>
            )}

            {modalType === 'order' && (
              <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Order Type</label>
                    <select
                      value={orderForm.orderType}
                      onChange={(e: any) => setOrderForm({ ...orderForm, orderType: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    >
                      <option value="SALE">SALE (Client Service)</option>
                      <option value="PURCHASE">PURCHASE (Consumable/Fuel)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Counterparty</label>
                    <input
                      type="text"
                      required
                      value={orderForm.counterpartyName}
                      onChange={(e) => setOrderForm({ ...orderForm, counterpartyName: e.target.value })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Commodity / Material Item</label>
                  <input
                    type="text"
                    required
                    value={orderForm.itemOrCommodity}
                    onChange={(e) => setOrderForm({ ...orderForm, itemOrCommodity: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Quantity</label>
                    <input
                      type="number"
                      required
                      value={orderForm.quantity}
                      onChange={(e) => setOrderForm({ ...orderForm, quantity: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Unit Rate (INR)</label>
                    <input
                      type="number"
                      required
                      value={orderForm.unitRate}
                      onChange={(e) => setOrderForm({ ...orderForm, unitRate: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full rounded-xl bg-blue-600 py-2.5 font-bold text-white transition hover:bg-blue-500 disabled:opacity-50"
                >
                  {formSubmitting ? 'Registering...' : 'Register Contract Order'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
