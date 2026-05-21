// src/components/ui/StatCard.jsx
// Dashboard stat card with icon and trend

const StatCard = ({ label, value, icon, colorClass, subLabel }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${colorClass}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-0.5">{label}</p>
      <p className="font-display text-2xl font-bold text-slate-900">{value ?? '—'}</p>
      {subLabel && <p className="text-xs text-slate-400 mt-0.5">{subLabel}</p>}
    </div>
  </div>
);

export default StatCard;
