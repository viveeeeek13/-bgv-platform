// src/pages/CandidateDetailPage.jsx
// Full candidate details, verification trigger, report download, logs timeline

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { candidateAPI, verificationAPI, reportAPI } from '../services/api';
import StatusBadge from '../components/ui/StatusBadge';
import Spinner from '../components/ui/Spinner';
import VerificationTimeline from '../components/verification/VerificationTimeline';
import ConfirmModal from '../components/ui/ConfirmModal';

const DetailRow = ({ label, value, mono = false }) => (
  <div className="py-3 flex items-start gap-4 border-b border-slate-100 last:border-0">
    <dt className="w-36 flex-shrink-0 text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</dt>
    <dd className={`flex-1 text-sm text-slate-800 ${mono ? 'font-mono' : ''}`}>{value || '—'}</dd>
  </div>
);

const CandidateDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [cRes, lRes] = await Promise.all([
        candidateAPI.getById(id),
        verificationAPI.getLogs(id),
      ]);
      setCandidate(cRes.data.data.candidate);
      setLogs(lRes.data.data.logs);
    } catch {
      toast.error('Failed to load candidate');
      navigate('/candidates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await verificationAPI.start(id);
      toast.success(`Verification complete: ${res.data.data.overallStatus}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleDownload = async () => {
    setDownloadLoading(true);
    try {
      await reportAPI.download(id, candidate.fullName);
      toast.success('Report downloaded!');
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await candidateAPI.delete(id);
      toast.success('Candidate deleted');
      navigate('/candidates');
    } catch {
      toast.error('Failed to delete');
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!candidate) return null;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link to="/candidates" className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-2xl font-bold text-slate-900">{candidate.fullName}</h1>
              <StatusBadge status={candidate.status} />
            </div>
            <p className="text-sm text-slate-500 mt-0.5">{candidate.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {candidate.status === 'PENDING' && (
            <Link to={`/candidates/${id}/edit`} className="btn-secondary">
              ✏️ Edit
            </Link>
          )}
          <button
            onClick={handleVerify}
            disabled={verifying || candidate.status === 'VERIFIED'}
            className="btn-primary"
          >
            {verifying ? <><Spinner size="sm" /> Verifying...</> : '🔍 Start Verification'}
          </button>
          {candidate.status !== 'PENDING' && (
            <button onClick={handleDownload} disabled={downloadLoading} className="btn-secondary">
              {downloadLoading ? <><Spinner size="sm" /> Generating...</> : '📄 Download Report'}
            </button>
          )}
          <button onClick={() => setDeleteModal(true)} className="btn-danger">
            🗑 Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-5">
            <h2 className="font-display text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">
              Personal Information
            </h2>
            <dl>
              <DetailRow label="Full Name" value={candidate.fullName} />
              <DetailRow label="Email" value={candidate.email} />
              <DetailRow label="Phone" value={candidate.phone} />
              <DetailRow label="Date of Birth" value={candidate.dob ? format(new Date(candidate.dob), 'dd MMMM yyyy') : '—'} />
              <DetailRow label="Address" value={candidate.address} />
            </dl>
          </div>

          <div className="card p-5">
            <h2 className="font-display text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">
              Identity Documents
            </h2>
            <dl>
              <DetailRow label="Aadhaar No." value={candidate.aadhaarNumber} mono />
              <DetailRow label="PAN No." value={candidate.panNumber} mono />
            </dl>
          </div>

          {/* Verification CTA if pending */}
          {candidate.status === 'PENDING' && (
            <div className="rounded-xl border-2 border-dashed border-brand-200 bg-brand-50 p-6 text-center">
              <p className="text-2xl mb-2">🔍</p>
              <h3 className="font-display font-bold text-slate-800 mb-1">Ready to Verify</h3>
              <p className="text-sm text-slate-500 mb-4">
                Click "Start Verification" to run Aadhaar and PAN checks.
              </p>
              <button onClick={handleVerify} disabled={verifying} className="btn-primary">
                {verifying ? <><Spinner size="sm" /> Verifying...</> : 'Start Verification'}
              </button>
            </div>
          )}
        </div>

        {/* Sidebar: Status + Timeline */}
        <div className="space-y-6">
          {/* Status card */}
          <div className="card p-5">
            <h2 className="font-display text-base font-bold text-slate-800 mb-4">Verification Status</h2>
            <div className="flex flex-col items-center text-center py-4">
              <div className="text-4xl mb-3">
                {candidate.status === 'VERIFIED' ? '✅' :
                 candidate.status === 'FAILED' ? '❌' :
                 candidate.status === 'PARTIAL' ? '⚠️' : '⏳'}
              </div>
              <StatusBadge status={candidate.status} />
              <p className="text-xs text-slate-400 mt-2">
                Last updated: {candidate.updatedAt ? format(new Date(candidate.updatedAt), 'dd MMM yyyy, HH:mm') : '—'}
              </p>
            </div>

            {candidate.status !== 'PENDING' && (
              <button
                onClick={handleDownload}
                disabled={downloadLoading}
                className="btn-primary w-full mt-2"
              >
                {downloadLoading ? <><Spinner size="sm" /> Generating...</> : '📄 Download PDF Report'}
              </button>
            )}
          </div>

          {/* Meta */}
          <div className="card p-5">
            <h2 className="font-display text-base font-bold text-slate-800 mb-3">Record Info</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Created</dt>
                <dd className="text-slate-700 font-medium text-xs">
                  {candidate.createdAt ? format(new Date(candidate.createdAt), 'dd MMM yyyy') : '—'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Verifications run</dt>
                <dd className="text-slate-700 font-medium">{logs.length}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Verification Timeline */}
      {logs.length > 0 && (
        <div className="card p-5">
          <h2 className="font-display text-base font-bold text-slate-800 mb-5">Verification History</h2>
          <VerificationTimeline logs={logs} />
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal}
        title="Delete Candidate"
        message={`Permanently delete "${candidate.fullName}" and all their verification records?`}
        confirmLabel="Delete"
        danger
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal(false)}
      />
    </div>
  );
};

export default CandidateDetailPage;
