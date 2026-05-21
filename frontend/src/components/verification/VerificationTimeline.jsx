// src/components/verification/VerificationTimeline.jsx
// Displays verification log entries in a timeline format

import { format } from 'date-fns';

const VerificationTimeline = ({ logs }) => {
  if (!logs?.length) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        No verification history yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log, idx) => {
        const passed = log.verificationStatus === 'verified';
        return (
          <div key={log._id || idx} className="flex gap-4">
            {/* Icon */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                  passed
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {log.verificationType === 'AADHAAR' ? '🪪' : '📋'}
              </div>
              {idx < logs.length - 1 && <div className="mt-1 h-full w-px bg-slate-200" />}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {log.verificationType} Verification
                  </p>
                  <p className="text-xs text-slate-400">
                    {log.verifiedAt ? format(new Date(log.verifiedAt), 'dd MMM yyyy, HH:mm') : 'N/A'}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    passed
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                      : 'bg-red-50 text-red-700 ring-1 ring-red-600/20'
                  }`}
                >
                  {log.verificationStatus?.toUpperCase()}
                </span>
              </div>

              {/* API Response Preview */}
              <div className="mt-2 rounded-lg bg-slate-50 border border-slate-200 p-3">
                <p className="text-xs font-medium text-slate-600 mb-1">Response:</p>
                <p className="text-xs text-slate-500">
                  {log.responsePayload?.message || 'No message'}
                </p>
                {log.responsePayload?.referenceId && (
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    Ref: {log.responsePayload.referenceId}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VerificationTimeline;
