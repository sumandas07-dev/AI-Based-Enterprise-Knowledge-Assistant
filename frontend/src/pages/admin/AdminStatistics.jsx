import React, { useEffect, useState } from 'react';
import { 
  BarChart2, 
  Users, 
  FileText, 
  MessageSquare, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle,
  Loader,
  RefreshCw
} from 'lucide-react';
import { statisticsApi } from '../../api/api';
import { Button } from '../../components/common/Button';

export const AdminStatistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await statisticsApi.getStatistics();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  return (
    <div className="p-6 text-slate-100 bg-slate-950 min-h-screen space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">System Statistics</h1>
          <p className="mt-1 text-slate-400">Detailed overview of users, documents, and chat sessions.</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 py-2 px-4 rounded-lg border border-slate-700 font-medium text-white transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Stats
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader className="h-10 w-10 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base">Employee Breakdown</h3>
                <Users className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/40 p-4 rounded-lg border border-slate-800/40">
                  <span className="text-xs text-slate-500 block uppercase font-semibold">Active Profiles</span>
                  <span className="text-2xl font-bold text-green-400">{stats?.activeEmployees || 0}</span>
                </div>
                <div className="bg-slate-950/40 p-4 rounded-lg border border-slate-800/40">
                  <span className="text-xs text-slate-500 block uppercase font-semibold">Deactivated</span>
                  <span className="text-2xl font-bold text-slate-400">{stats?.inactiveEmployees || 0}</span>
                </div>
              </div>
              <div className="text-xs text-slate-500">
                Out of {stats?.totalEmployees || 0} total employee profiles
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base">Document Ingest States</h3>
                <FileText className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/40 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold truncate">Indexed</span>
                  <span className="text-xl font-bold text-green-400">{stats?.indexedDocuments || 0}</span>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/40 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold truncate">Processing</span>
                  <span className="text-xl font-bold text-yellow-400">{stats?.processingDocuments || 0}</span>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/40 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold truncate">Failed</span>
                  <span className="text-xl font-bold text-red-400">{stats?.failedDocuments || 0}</span>
                </div>
              </div>
              <div className="text-xs text-slate-500">
                Out of {stats?.totalDocuments || 0} total uploaded PDFs
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base">AI Chat Metrics</h3>
                  <MessageSquare className="h-5 w-5 text-indigo-400" />
                </div>
                <div className="mt-4 bg-slate-950/40 p-4 rounded-lg border border-slate-800/40 flex items-center justify-between">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Total Conversations</span>
                  <span className="text-2xl font-bold text-white">{stats?.totalChats || 0}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Total chat sessions instantiated in MongoDB.
              </p>
            </div>
          </div>

          {/* Details list */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">System Integrations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-300">
              <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Express Gateway API</p>
                  <p className="text-xs text-slate-500">Runs routing & auth controls</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Connected
                </span>
              </div>
              <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">FastAPI RAG Pipeline</p>
                  <p className="text-xs text-slate-500">Pinecone & LLM pipeline</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Connected
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
