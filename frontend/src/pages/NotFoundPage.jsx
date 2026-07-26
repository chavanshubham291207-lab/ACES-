import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-20 h-20 rounded-3xl bg-blue-600/10 text-blue-500 flex items-center justify-center mb-6 border border-blue-500/20">
        <AlertCircle className="w-10 h-10" />
      </div>
      <h1 className="text-6xl font-extrabold text-white mb-2">404</h1>
      <h2 className="text-xl font-bold text-slate-300 mb-2">Page Not Found</h2>
      <p className="text-xs text-slate-500 max-w-sm mb-8">
        The ACES portal page you are searching for does not exist or has been moved.
      </p>
      <Link to="/" className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30">
        <ArrowLeft className="w-4 h-4" /> Return to Homepage
      </Link>
    </div>
  );
};

export default NotFoundPage;
