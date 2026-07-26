import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { CardSkeleton } from '../common/Skeleton';

const AdminLayout = ({ requireAdmin = false }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
        <CardSkeleton />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If page requires Admin permissions and user is not Admin -> redirect to Member Dashboard
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-h-screen pb-12">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
