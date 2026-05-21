// src/pages/CreateCandidatePage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { candidateAPI } from '../services/api';
import CandidateForm from '../components/candidates/CandidateForm';

const CreateCandidatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await candidateAPI.create(data);
      toast.success('Candidate created successfully!');
      navigate(`/candidates/${res.data.data.candidate._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create candidate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/candidates" className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Add New Candidate</h1>
          <p className="text-sm text-slate-500 mt-0.5">Fill in the details to register a candidate for verification</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="rounded-xl bg-brand-50 border border-brand-200 p-4 flex gap-3">
        <span className="text-brand-600 text-lg flex-shrink-0">ℹ️</span>
        <div className="text-sm text-brand-700">
          <strong>Privacy note:</strong> Aadhaar numbers are masked (XXXX-XXXX-1234) in all reports and logs. Raw numbers are never exposed after submission.
        </div>
      </div>

      {/* Form */}
      <div className="card p-6">
        <CandidateForm onSubmit={onSubmit} loading={loading} submitLabel="Create Candidate" />
      </div>
    </div>
  );
};

export default CreateCandidatePage;
