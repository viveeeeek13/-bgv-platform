// src/pages/CandidateListPage.jsx
// Paginated, searchable, filterable candidate list

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { candidateAPI } from '../services/api';
import StatusBadge from '../components/ui/StatusBadge';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import ConfirmModal from '../components/ui/ConfirmModal';
import { format } from 'date-fns';

const STATUS_FILTERS = ['ALL', 'PENDING', 'VERIFIED', 'PARTIAL', 'FAILED'];

const CandidateListPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCandidates = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await candidateAPI.getAll(params);
      setCandidates(res.data.data.candidates);
      setPagination(res.data.data.pagination);
    } catch {
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => fetchCandidates(1), 300);
    return () => clearTimeout(timer);
  }, [fetchCandidates]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await candidateAPI.delete(deleteModal.id);
      toast.success('Candidate deleted');
      setDeleteModal({ open: false, id: null, name: '' });
      fetchCandidates(pagination.page);
    } catch {
      toast.error('Failed to delete candidate');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Candidates</h1>
          <p className="text-sm text-slate-500 mt-0.5">{pagination.total} total candidates</p>
        </div>
        <Link to="/candidates/new" className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Candidate
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or phone..."
            className="input-field pl-9"
          />
        </div>
        {/* Status filter */}
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === s
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : candidates.length === 0 ? (
          <EmptyState
            icon="👤"
            title="No candidates found"
            description={search || statusFilter !== 'ALL' ? 'Try adjusting your filters.' : 'Add your first candidate to get started.'}
            action={
              !search && statusFilter === 'ALL' && (
                <Link to="/candidates/new" className="btn-primary">Add Candidate</Link>
              )
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    {['Candidate', 'Contact', 'PAN', 'Status', 'Created', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {candidates.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">
                            {c.fullName?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{c.fullName}</p>
                            <p className="text-xs text-slate-400">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">{c.phone}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{c.panNumber}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={c.status} /></td>
                      <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                        {c.createdAt ? format(new Date(c.createdAt), 'dd MMM yyyy') : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/candidates/${c._id}`}
                            className="text-brand-600 hover:text-brand-700 font-semibold text-xs px-2 py-1 rounded hover:bg-brand-50 transition-colors"
                          >
                            View
                          </Link>
                          {c.status === 'PENDING' && (
                            <Link
                              to={`/candidates/${c._id}/edit`}
                              className="text-slate-500 hover:text-slate-700 font-semibold text-xs px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                            >
                              Edit
                            </Link>
                          )}
                          <button
                            onClick={() => setDeleteModal({ open: true, id: c._id, name: c.fullName })}
                            className="text-red-500 hover:text-red-700 font-semibold text-xs px-2 py-1 rounded hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchCandidates(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() => fetchCandidates(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModal.open}
        title="Delete Candidate"
        message={`Are you sure you want to delete "${deleteModal.name}"? This will also delete all verification logs. This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, id: null, name: '' })}
      />
    </div>
  );
};

export default CandidateListPage;
