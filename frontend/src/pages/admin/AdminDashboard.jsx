import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Settings,
  Plus
} from 'lucide-react';
import { statisticsApi } from '../../api/api';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await statisticsApi.getStatistics();
        setStats(data);
      } catch (err) {
        console.error('Failed to load statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 p-6 text-slate-100 bg-slate-950 min-h-screen">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Console</h1>
        <p className="mt-1 text-slate-400">Overview metrics and system statistics of your enterprise workspace.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-32 bg-slate-900 rounded-xl border border-slate-800"></div>
          ))}
        </div>
      ) : (
        <>
          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-md backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Total Employees</p>
                  <p className="mt-2 text-3xl font-bold text-white">{stats?.totalEmployees || 0}</p>
                </div>
                <div className="rounded-lg bg-indigo-500/10 p-3 text-indigo-400 border border-indigo-500/20">
                  <Users className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-green-400 gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>{stats?.activeEmployees || 0} active workers</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-md backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Uploaded Documents</p>
                  <p className="mt-2 text-3xl font-bold text-white">{stats?.totalDocuments || 0}</p>
                </div>
                <div className="rounded-lg bg-indigo-500/10 p-3 text-indigo-400 border border-indigo-500/20">
                  <FileText className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-green-400 gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>{stats?.indexedDocuments || 0} indexed successfully</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-md backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Failed Processing</p>
                  <p className="mt-2 text-3xl font-bold text-red-400">{stats?.failedDocuments || 0}</p>
                </div>
                <div className="rounded-lg bg-red-500/10 p-3 text-red-400 border border-red-500/20">
                  <FileText className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 text-xs text-slate-400">
                {stats?.processingDocuments || 0} documents processing currently
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-md backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Conversations Initiated</p>
                  <p className="mt-2 text-3xl font-bold text-white">{stats?.totalChats || 0}</p>
                </div>
                <div className="rounded-lg bg-indigo-500/10 p-3 text-indigo-400 border border-indigo-500/20">
                  <MessageSquare className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 text-xs text-slate-400">
                AI Assistant sessions running
              </div>
            </div>
          </div>

          {/* Action Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 shadow-md">
              <h2 className="text-xl font-bold text-white mb-2">Employee Operations</h2>
              <p className="text-slate-400 text-sm mb-6">Create single employee login keys, edit department listings, toggle active user states, or import workers in bulk using excel sheets.</p>
              <div className="flex gap-4">
                <Link
                  to="/admin/employees"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors shadow-lg"
                >
                  Manage Employees
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 shadow-md">
              <h2 className="text-xl font-bold text-white mb-2">Knowledge Base Documents</h2>
              <p className="text-slate-400 text-sm mb-6">Upload raw PDF guides and documentations to Cloudinary, track ingestion statuses, or wipe documents from Pinecone vector databases.</p>
              <div className="flex gap-4">
                <Link
                  to="/admin/documents"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors shadow-lg"
                >
                  Document Ingestion
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
