// src/pages/EditCandidatePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { candidateAPI } from '../services/api';
import CandidateForm from '../components/candidates/CandidateForm';
import Spinner from '../components/ui/Spinner';
import { format } from 'date-fns';

const EditCandidatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [defaultValues, setDefaultValues] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await candidateAPI.getById(id);
        const c = res.data.data.candidate;

        if (c.status !== 'PENDING') {
          toast.error('Cannot edit candidate after verification has started');
          navigate(`/candidates/${id}`);
          return;
        }

        setDefaultValues({
          fullName: c.fullName,
          email: c.email,
          phone: c.phone,
          dob: c.dob ? format(new Date(c.dob), 'yyyy-MM-dd') : '',
          // Don't pre-fill Aadhaar/PAN for security - user must re-enter
          aadhaarNumber: '',
          panNumber: c.panNumber || '',
          address: c.address,
        });
      } catch {
        toast.error('Failed to load candidate');
        navigate('/candidates');
      } finally {
        setFetching(false);
      }
    };
    fetch();
  }, [id, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await candidateAPI.update(id, data);
      toast.success('Candidate updated successfully!');
      navigate(`/candidates/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update candidate');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to={`/candidates/${id}`} className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Edit Candidate</h1>
          <p className="text-sm text-slate-500 mt-0.5">Update candidate details (only allowed before verification starts)</p>
        </div>
      </div>

      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex gap-3">
        <span className="text-amber-600 text-lg flex-shrink-0">⚠️</span>
        <p className="text-sm text-amber-700">
          For security, please re-enter the Aadhaar number. PAN is pre-filled from the existing record.
        </p>
      </div>

      <div className="card p-6">
        {defaultValues && (
          <CandidateForm
            onSubmit={onSubmit}
            defaultValues={defaultValues}
            loading={loading}
            submitLabel="Save Changes"
          />
        )}
      </div>
    </div>
  );
};

export default EditCandidatePage;
