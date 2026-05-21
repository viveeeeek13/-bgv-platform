// src/components/layout/Topbar.jsx
// Top navigation bar with breadcrumb and menu button

import { useLocation, Link } from 'react-router-dom';

const breadcrumbMap = {
  '/dashboard': 'Dashboard',
  '/candidates': 'Candidates',
  '/candidates/new': 'New Candidate',
};

const Topbar = ({ onMenuClick }) => {
  const { pathname } = useLocation();
  const label = breadcrumbMap[pathname] || (pathname.includes('/edit') ? 'Edit Candidate' : 'Candidate Details');

  return (
    <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 md:px-6 shadow-sm">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden -ml-1 p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link to="/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors">
          Home
        </Link>
        <span className="text-slate-300">/</span>
        <span className="font-semibold text-slate-800">{label}</span>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-slow"></span>
          System Online
        </div>
      </div>
    </header>
  );
};

export default Topbar;
