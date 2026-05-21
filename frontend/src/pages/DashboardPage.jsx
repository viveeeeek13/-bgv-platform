// src/pages/DashboardPage.jsx
// Main dashboard with stats cards and recent candidates

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { candidateAPI } from '../services/api';
import useAuthStore from '../store/authStore';
import StatCard from '../components/ui/StatCard';
import StatusBadge from '../components/ui/StatusBadge';
import Spinner from '../components/ui/Spinner';
import { format } from 'date-fns';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, candidatesRes] = await Promise.all([
          candidateAPI.getStats(),
          candidateAPI.getAll({ limit: 5, page: 1 }),
        ]);
        setStats(statsRes.data.data.stats);
        setRecent(candidatesRes.data.data.candidates);
      } catch (_) {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const statCards = [
    { label: 'Total Candidates', key: 'total', icon: '👥', colorClass: 'bg-blue-50 text-blue-600' },
    { label: 'Verified', key: 'verified', icon: '✅', colorClass: 'bg-emerald-50 text-emerald-600' },
    { label: 'Pending', key: 'pending', icon: '⏳', colorClass: 'bg-amber-50 text-amber-600' },
    { label: 'Failed', key: 'failed', icon: '❌', colorClass: 'bg-red-50 text-red-600' },
  ];

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Here's what's happening with your verifications today.</p>
        </div>
        <Link to="/candidates/new" className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Candidate
        </Link>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((s) => (
              <StatCard
                key={s.key}
                label={s.label}
                value={stats?.[s.key] ?? 0}
                icon={s.icon}
                colorClass={s.colorClass}
              />
            ))}
          </div>

          {/* Progress bar: Verified % */}
          {stats?.total > 0 && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-700">Verification Progress</p>
                <p className="text-sm font-bold text-slate-900">
                  {Math.round((stats.verified / stats.total) * 100)}% complete
                </p>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500 transition-all duration-700"
                  style={{ width: `${Math.round((stats.verified / stats.total) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-400">
                <span>{stats.verified} verified</span>
                <span>{stats.total} total</span>
              </div>
            </div>
          )}

          {/* Status breakdown */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: 'Partial', key: 'partial', color: 'bg-amber-400', lightColor: 'text-amber-700 bg-amber-50' },
              { label: 'Failed', key: 'failed', color: 'bg-red-400', lightColor: 'text-red-700 bg-red-50' },
              { label: 'Pending', key: 'pending', color: 'bg-slate-400', lightColor: 'text-slate-600 bg-slate-100' },
            ].map((item) => (
              <div key={item.key} className="card p-4 flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${item.color}`} />
                <span className="text-sm text-slate-600">{item.label}</span>
                <span className={`ml-auto text-sm font-bold rounded-full px-2 py-0.5 ${item.lightColor}`}>
                  {stats?.[item.key] ?? 0}
                </span>
              </div>
            ))}
          </div>

          {/* Recent Candidates */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-display text-base font-bold text-slate-800">Recent Candidates</h2>
              <Link to="/candidates" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                View all →
              </Link>
            </div>

            {recent.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-3xl mb-3">👤</p>
                <p className="text-sm text-slate-500">No candidates yet. Add your first one!</p>
                <Link to="/candidates/new" className="btn-primary mt-4 inline-flex">Add Candidate</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 hidden sm:table-cell">Email</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 hidden md:table-cell">Created</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recent.map((c) => (
                      <tr key={c._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-xs flex-shrink-0">
                              {c.fullName?.charAt(0)?.toUpperCase()}
                            </div>
                            <span className="font-medium text-slate-800">{c.fullName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 hidden sm:table-cell">{c.email}</td>
                        <td className="px-5 py-3.5"><StatusBadge status={c.status} /></td>
                        <td className="px-5 py-3.5 text-slate-400 hidden md:table-cell">
                          {c.createdAt ? format(new Date(c.createdAt), 'dd MMM yyyy') : '—'}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Link to={`/candidates/${c._id}`} className="text-brand-600 hover:text-brand-700 font-semibold text-xs">
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
