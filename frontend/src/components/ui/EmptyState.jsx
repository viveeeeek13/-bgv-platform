// src/components/ui/EmptyState.jsx
const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="mb-4 text-5xl">{icon || '📭'}</div>
    <h3 className="font-display text-lg font-bold text-slate-800 mb-1">{title}</h3>
    {description && <p className="text-sm text-slate-500 mb-6 max-w-xs">{description}</p>}
    {action}
  </div>
);

export default EmptyState;
