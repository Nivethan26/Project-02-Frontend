"use client";
import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

type SummaryItem = { totalAmount: number; count: number };
type SummaryResponse = {
  success: boolean;
  summaryByType: Record<string, SummaryItem>;
  summaryByMethod: Record<string, SummaryItem>;
  totals: { totalRevenue: number; totalCount: number };
};

type MonthlyItem = { month: number; totalAmount: number; count: number };
type MonthlyResponse = { success: boolean; year: number; paymentType: string; monthly: MonthlyItem[] };

export default function ReportPage() {
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<{ startDate: string; endDate: string }>({ startDate: '', endDate: '' });
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [monthly, setMonthly] = useState<MonthlyResponse | null>(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (range.startDate) params.append('startDate', range.startDate);
      if (range.endDate) params.append('endDate', range.endDate);
      const res = await fetch(`http://localhost:8000/api/payments/summary?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to load report');
      setData(json);
    } catch (e: any) {
      setError(e.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMonthly = async () => {
    try {
      const params = new URLSearchParams();
      params.set('year', String(year));
      params.set('paymentType', typeFilter);
      const res = await fetch(`http://localhost:8000/api/payments/summary/monthly?${params.toString()}`);
      const json: MonthlyResponse = await res.json();
      if (!res.ok || !json.success) throw new Error((json as any).message || 'Failed to load monthly revenue');
      setMonthly(json);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMonthly();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, typeFilter]);

  const typeCards = useMemo(() => {
    if (!data) return [] as Array<{ key: string; value: SummaryItem; color: string; icon: React.ReactNode }>;
    const palette = {
      pos: 'from-emerald-400 to-emerald-600',
      online: 'from-sky-400 to-sky-600',
      prescription: 'from-indigo-400 to-indigo-600',
      consultation: 'from-fuchsia-400 to-fuchsia-600',
      unknown: 'from-slate-400 to-slate-600',
    } as Record<string, string>;
    const icon = (
      <svg className="w-6 h-6 opacity-90" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3m6 0a3 3 0 00-3-3m0 0V4m0 7v9" />
      </svg>
    );
    return Object.entries(data.summaryByType).map(([k, v]) => ({ key: k, value: v, color: palette[k] || palette.unknown, icon }));
  }, [data]);

  return (
    <ProtectedRoute role="admin">
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="admin" />
        <main className="flex-1 ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Revenue Reports</h1>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col md:flex-row gap-3 md:items-end">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                <input type="date" className="w-full border rounded px-3 py-2" value={range.startDate} onChange={e => setRange(r => ({ ...r, startDate: e.target.value }))} />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">End Date</label>
                <input type="date" className="w-full border rounded px-3 py-2" value={range.endDate} onChange={e => setRange(r => ({ ...r, endDate: e.target.value }))} />
              </div>
              <button onClick={fetchSummary} className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow">Apply</button>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="col-span-1 md:col-span-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl p-6 shadow flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Revenue</p>
                  <p className="text-3xl font-extrabold">LKR {Number(data?.totals.totalRevenue || 0).toLocaleString()}</p>
                </div>
                <svg className="w-12 h-12 text-white/70" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 15l3-3 4 4 5-6"/></svg>
              </div>
              <div className="bg-white rounded-xl p-6 shadow border">
                <p className="text-gray-500">Transactions</p>
                <p className="text-3xl font-extrabold text-gray-800">{Number(data?.totals.totalCount || 0).toLocaleString()}</p>
              </div>
            </div>

            {/* Monthly Revenue Chart */}
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Monthly Revenue</h2>
                <div className="flex gap-3">
                  <select className="border rounded px-3 py-2" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                    <option value="all">All Types</option>
                    <option value="pos">POS</option>
                    <option value="online">Online</option>
                    <option value="prescription">Prescription</option>
                    <option value="consultation">Consultation</option>
                  </select>
                  <select className="border rounded px-3 py-2" value={year} onChange={e => setYear(parseInt(e.target.value))}>
                    {Array.from({ length: 6 }).map((_, i) => {
                      const y = currentYear - i;
                      return <option key={y} value={y}>{y}</option>;
                    })}
                  </select>
                </div>
              </div>

              {monthly ? (
                <MonthlyBarChart data={monthly.monthly} />
              ) : (
                <div className="text-gray-500">Loading chart...</div>
              )}
            </div>

            {/* By Type Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {loading ? (
                <div className="col-span-full text-center text-gray-500">Loading...</div>
              ) : error ? (
                <div className="col-span-full text-center text-red-600">{error}</div>
              ) : typeCards.length === 0 ? (
                <div className="col-span-full text-center text-gray-500">No data</div>
              ) : (
                typeCards.map(card => (
                  <div key={card.key} className={`rounded-xl p-5 text-white shadow bg-gradient-to-br ${card.color}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold capitalize">{card.key}</span>
                      {card.icon}
                    </div>
                    <div className="mt-4">
                      <div className="text-2xl font-extrabold">LKR {card.value.totalAmount.toLocaleString()}</div>
                      <div className="text-white/80">{card.value.count} payments</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* By Method Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="px-6 py-4 border-b"><h2 className="font-semibold text-gray-800">By Payment Method</h2></div>
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (LKR)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data?.summaryByMethod || {}).map(([method, val]) => (
                    <tr key={method} className="border-t">
                      <td className="px-6 py-3 capitalize">{method || 'unknown'}</td>
                      <td className="px-6 py-3 text-right">{val.count.toLocaleString()}</td>
                      <td className="px-6 py-3 text-right">{val.totalAmount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

// Simple SVG Bar Chart component (no external deps)
function MonthlyBarChart({ data }: { data: MonthlyItem[] }) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const max = Math.max(1, ...data.map(d => d.totalAmount));
  const height = 220;
  const barWidth = 36;
  const gap = 16;
  const width = data.length * (barWidth + gap) + gap;
  const scale = (v: number) => (v / max) * (height - 30);

  return (
    <div className="w-full overflow-x-auto">
      <svg width={width} height={height + 40} className="text-slate-500">
        {/* Axis line */}
        <line x1={0} y1={height} x2={width} y2={height} stroke="#E5E7EB" />
        {data.map((d, i) => {
          const h = scale(d.totalAmount);
          const x = gap + i * (barWidth + gap);
          const y = height - h;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barWidth} height={h} rx={6} className="fill-blue-500 hover:fill-blue-600 transition-colors" />
              <text x={x + barWidth / 2} y={height + 16} textAnchor="middle" fontSize="10">{months[i]}</text>
              <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fontSize="10" className="fill-slate-600">{d.totalAmount.toLocaleString()}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}