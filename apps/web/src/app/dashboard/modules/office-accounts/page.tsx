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
} from '@/lib/modules-api';

export default function OfficeAccountsModulePage() {
  const [activeTab, setActiveTab] = useState<'invoices' | 'collections' | 'expenses' | 'orders'>('invoices');
  const [invoices, setInvoices] = useState<AccountInvoice[]>([]);
  const [collections, setCollections] = useState<PaymentCollection[]>([]);
  const [expenses, setExpenses] = useState<AccountExpense[]>([]);
  const [orders, setOrders] = useState<PurchaseSaleOrder[]>([]);

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
    </div>
  );
}

