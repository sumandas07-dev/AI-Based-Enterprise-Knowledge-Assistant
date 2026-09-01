import React, { useEffect, useState, useRef } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Trash2, 
  Loader, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { documentApi } from '../../api/api';
import { Button } from '../../components/common/Button';

export const AdminDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Ingest upload states
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const fileInputRef = useRef(null);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const data = await documentApi.getDocuments();
      setDocuments(data);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setUploadError('');
      setUploadSuccess(false);
    } else {
      setFile(null);
      setUploadError('Only PDF files are supported.');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadError('');
    setUploadSuccess(false);

    try {
      await documentApi.uploadDocument(file, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percent);
      });
      setUploadSuccess(true);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchDocs();
    } catch (err) {
      console.error(err);
      setUploadError(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document? This will remove all mapped vectors from Pinecone as well.')) return;
    try {
      await documentApi.deleteDocument(id);
      fetchDocs();
    } catch (err) {
      console.error(err);
      alert('Failed to delete document.');
    }
  };

  // Filter local document listings by search string
  const filteredDocs = documents.filter(doc => 
    doc.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 text-slate-100 bg-slate-950 min-h-screen space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Knowledge Base Documents</h1>
        <p className="mt-1 text-slate-400">Ingest corporate guidelines and PDF sheets into the AI vector indexing engine.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Panel */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 shadow-md h-fit space-y-4">
          <h2 className="text-lg font-bold text-white">Upload PDF Document</h2>
          
          {uploadError && (
            <div className="rounded border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="rounded border border-green-500/20 bg-green-500/10 p-3 text-xs text-green-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Ingestion started successfully! Check index progress in the list.</span>
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="border-2 border-dashed border-slate-800 rounded-lg p-8 text-center hover:border-indigo-500/50 transition-colors">
              <UploadCloud className="mx-auto h-10 w-10 text-slate-500" />
              <p className="mt-2 text-sm text-slate-300">Choose PDF Document</p>
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf"
                onChange={handleFileChange}
                className="mt-4 text-xs text-slate-500 w-full"
              />
              {file && (
                <p className="mt-2 text-xs font-mono text-indigo-400 truncate">{file.name}</p>
              )}
            </div>

            {uploading && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Uploading to Cloudinary & Ingesting...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded overflow-hidden">
                  <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={!file || uploading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-colors"
            >
              {uploading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Indexing vectors...
                </>
              ) : (
                'Start Indexing'
              )}
            </Button>
          </form>
        </div>

        {/* Documents Listing */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 max-w-md">
            <Search className="h-5 w-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search documents by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-0 text-white placeholder-slate-500 focus:outline-none focus:ring-0 text-sm w-full"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader className="h-10 w-10 animate-spin text-indigo-500" />
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-16 text-center">
              <FileText className="mx-auto h-12 w-12 text-slate-600" />
              <h3 className="mt-4 text-lg font-medium text-slate-300">No documents indexed</h3>
              <p className="mt-2 text-sm text-slate-500">Upload a corporate guideline to fill your knowledge library.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDocs.map((doc) => (
                <div key={doc._id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 shadow-sm space-y-4 hover:border-slate-700/60 transition-colors flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 text-indigo-400">
                        <FileText className="h-5 w-5 shrink-0" />
                        <h4 className="font-bold text-white text-sm line-clamp-1">{doc.filename}</h4>
                      </div>
                      <button
                        onClick={() => handleDelete(doc._id)}
                        className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span>Uploaded by:</span>
                      <span className="font-semibold text-slate-300">{doc.uploadedBy?.name || 'Admin'}</span>
                    </div>

                    {doc.createdAt && (
                      <p className="text-xs text-slate-500">
                        {new Date(doc.createdAt).toLocaleDateString()} at {new Date(doc.createdAt).toLocaleTimeString()}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800/40 flex items-center justify-between gap-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                      doc.status === 'completed'
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : doc.status === 'failed'
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                      {doc.status === 'completed' ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          Indexed
                        </>
                      ) : doc.status === 'failed' ? (
                        <>
                          <AlertCircle className="h-3 w-3" />
                          Failed
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3 animate-spin" />
                          Ingesting...
                        </>
                      )}
                    </span>

                    {doc.cloudinaryUrl && (
                      <a
                        href={doc.cloudinaryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        View File
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
