// src/components/candidates/CandidateForm.jsx
// Shared form for creating and editing candidates

import { useForm } from 'react-hook-form';
import Spinner from '../ui/Spinner';

const FormField = ({ label, error, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

const CandidateForm = ({ onSubmit, defaultValues = {}, loading = false, submitLabel = 'Save Candidate' }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Full Name */}
        <FormField label="Full Name" required error={errors.fullName?.message}>
          <input
            {...register('fullName', {
              required: 'Full name is required',
              minLength: { value: 2, message: 'At least 2 characters' },
            })}
            className={`input-field ${errors.fullName ? 'input-error' : ''}`}
            placeholder="e.g. Priya Sharma"
          />
        </FormField>

        {/* Email */}
        <FormField label="Email Address" required error={errors.email?.message}>
          <input
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email format' },
            })}
            className={`input-field ${errors.email ? 'input-error' : ''}`}
            placeholder="e.g. priya@company.com"
          />
        </FormField>

        {/* Phone */}
        <FormField label="Mobile Number" required error={errors.phone?.message}>
          <input
            {...register('phone', {
              required: 'Phone is required',
              pattern: { value: /^[6-9]\d{9}$/, message: 'Enter valid 10-digit Indian mobile' },
            })}
            className={`input-field ${errors.phone ? 'input-error' : ''}`}
            placeholder="e.g. 9876543210"
            maxLength={10}
          />
        </FormField>

        {/* DOB */}
        <FormField label="Date of Birth" required error={errors.dob?.message}>
          <input
            type="date"
            {...register('dob', {
              required: 'Date of birth is required',
              validate: (v) => {
                const dob = new Date(v);
                const minAge = new Date();
                minAge.setFullYear(minAge.getFullYear() - 18);
                return dob <= minAge || 'Candidate must be at least 18 years old';
              },
            })}
            className={`input-field ${errors.dob ? 'input-error' : ''}`}
          />
        </FormField>

        {/* Aadhaar */}
        <FormField label="Aadhaar Number" required error={errors.aadhaarNumber?.message}>
          <input
            {...register('aadhaarNumber', {
              required: 'Aadhaar is required',
              pattern: { value: /^\d{12}$/, message: 'Must be exactly 12 digits' },
            })}
            className={`input-field font-mono ${errors.aadhaarNumber ? 'input-error' : ''}`}
            placeholder="e.g. 123456789012"
            maxLength={12}
          />
        </FormField>

        {/* PAN */}
        <FormField label="PAN Number" required error={errors.panNumber?.message}>
          <input
            {...register('panNumber', {
              required: 'PAN is required',
              pattern: {
                value: /^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/,
                message: 'Invalid PAN (e.g. ABCDE1234F)',
              },
            })}
            className={`input-field font-mono tracking-widest uppercase ${errors.panNumber ? 'input-error' : ''}`}
            placeholder="e.g. ABCDE1234F"
            maxLength={10}
            style={{ textTransform: 'uppercase' }}
          />
        </FormField>
      </div>

      {/* Address - full width */}
      <FormField label="Address" required error={errors.address?.message}>
        <textarea
          {...register('address', {
            required: 'Address is required',
            maxLength: { value: 500, message: 'Max 500 characters' },
          })}
          rows={3}
          className={`input-field resize-none ${errors.address ? 'input-error' : ''}`}
          placeholder="Full residential address..."
        />
      </FormField>

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary min-w-[140px]">
          {loading && <Spinner size="sm" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default CandidateForm;
