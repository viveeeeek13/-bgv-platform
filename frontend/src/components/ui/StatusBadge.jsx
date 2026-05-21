// src/components/ui/StatusBadge.jsx
// Reusable status badge for candidate verification states

const STATUS_CONFIG = {
  VERIFIED: { label: 'Verified', className: 'badge-verified', dot: 'bg-emerald-500' },
  FAILED: { label: 'Failed', className: 'badge-failed', dot: 'bg-red-500' },
  PARTIAL: { label: 'Partial', className: 'badge-partial', dot: 'bg-amber-500' },
  PENDING: { label: 'Pending', className: 'badge-pending', dot: 'bg-slate-400' },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status?.toUpperCase()] || STATUS_CONFIG.PENDING;
  return (
    <span className={config.className}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
