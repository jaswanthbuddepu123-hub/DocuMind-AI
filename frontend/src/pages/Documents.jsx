import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { listDocuments, deleteDocument } from '../services/documentService';
import useDebounce from '../hooks/useDebounce';
import { Search, Filter, Trash2, File, CheckCircle2, Clock, XCircle, UploadCloud, ChevronLeft, ChevronRight, Loader2, ArrowUpDown, Eye } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Documents = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isCompact } = useTheme();

  // Read initial query params
  const initialStatus = useMemo(() => {
    return new URLSearchParams(location.search).get('status') || '';
  }, [location.search]);

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [typeFilter, setTypeFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const limit = isCompact ? 50 : 20;

  // Sync state if URL changes from outside (e.g., clicking dashboard links repeatedly)
  useEffect(() => {
    setStatusFilter(initialStatus);
  }, [initialStatus]);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        sort: sortOrder,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { type: typeFilter }),
      };
      const result = await listDocuments(params);
      setDocuments(result.data || []);
      setTotalCount(result.count || 0);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, statusFilter, typeFilter, sortOrder, page]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, typeFilter, sortOrder]);

  const handleDelete = async (e, id, filename) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete this document?\n\n"${filename}"`)) {
      try {
        await deleteDocument(id);
        // Optimistic UI update
        setDocuments(docs => docs.filter(d => d.id !== id));
        setTotalCount(c => c - 1);
      } catch (err) {
        console.error(err);
        alert('Failed to delete document. Please try again.');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1 w-max"><CheckCircle2 size={12} /> Completed</span>;
      case 'failed':
        return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full flex items-center gap-1 w-max"><XCircle size={12} /> Failed</span>;
      case 'processing':
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full flex items-center gap-1 animate-pulse w-max"><Clock size={12} /> Processing</span>;
      case 'uploaded':
      default:
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex items-center gap-1 w-max"><UploadCloud size={12} /> Uploaded</span>;
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Document History</h1>
          <p className="text-slate-400 mt-1">Manage and search through your processed files.</p>
        </div>
        <Link 
          to="/app/upload" 
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] flex items-center gap-2 shrink-0 hover:-translate-y-0.5"
        >
          <UploadCloud size={18} />
          Upload Document
        </Link>
      </div>

      {/* Filters and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl mb-6 flex flex-col lg:flex-row gap-4 justify-between items-center z-10 relative">
        <div className="w-full lg:w-1/3 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search filenames..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all outline-none text-slate-100"
          />
        </div>

        <div className="w-full lg:w-auto flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/10 transition-colors hover:bg-white/10 hover:border-indigo-400">
            <Filter size={16} className="text-slate-400" />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-200 outline-none cursor-pointer w-full [&>option]:bg-slate-900"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
              <option value="uploaded">Uploaded</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/10 transition-colors hover:bg-white/10 hover:border-indigo-400">
            <Filter size={16} className="text-slate-400" />
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-200 outline-none cursor-pointer w-full [&>option]:bg-slate-900"
            >
              <option value="">All Types</option>
              <option value="invoice">Invoice</option>
              <option value="receipt">Receipt</option>
              <option value="contract">Contract</option>
              <option value="purchase_order">Purchase Order</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/10 transition-colors hover:bg-white/10 hover:border-indigo-400">
            <ArrowUpDown size={16} className="text-slate-400" />
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-200 outline-none cursor-pointer w-full [&>option]:bg-slate-900"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Document Grid */}
      <div className="relative min-h-[400px]">
        {loading && documents.length === 0 ? (
           <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-10 backdrop-blur-sm rounded-3xl">
             <Loader2 size={32} className="animate-spin text-indigo-500" />
           </div>
        ) : error ? (
           <div className="p-12 text-center text-red-400 glass-panel rounded-3xl">
             <p>{error}</p>
             <button onClick={fetchDocs} className="mt-4 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-sm font-medium transition-colors">Retry</button>
           </div>
        ) : documents.length === 0 ? (
          <div className="p-16 text-center glass-panel rounded-3xl">
            <div className="w-20 h-20 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
              <File size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">No documents found</h3>
            <p className="text-slate-400 max-w-sm mx-auto">
              {search || statusFilter || typeFilter ? "Try adjusting your filters to find what you're looking for." : "You haven't uploaded any documents yet."}
            </p>
            {!(search || statusFilter || typeFilter) && (
              <Link to="/app/upload" className="mt-8 inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:-translate-y-0.5">
                <UploadCloud size={18} /> Upload Now
              </Link>
            )}
          </div>
        ) : (
          <div className={`grid grid-cols-1 md:grid-cols-2 ${isCompact ? 'lg:grid-cols-4 gap-4' : 'lg:grid-cols-3 gap-6'}`}>
            {documents.map((doc, index) => {
              // Handle PostgREST's return structure
              const resData = Array.isArray(doc.document_results) ? doc.document_results[0] : doc.document_results;
              
              return (
                <div 
                  key={doc.id} 
                  onClick={() => navigate(`/app/documents/${doc.id}`)}
                  className={`glass-card rounded-3xl ${isCompact ? 'p-4' : 'p-6'} cursor-pointer group flex flex-col relative overflow-hidden`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {!isCompact && <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full mix-blend-screen filter blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>}
                  
                  <div className={`flex justify-between items-start ${isCompact ? 'mb-3' : 'mb-4'} relative z-10`}>
                    <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                      <File size={24} />
                    </div>
                    {getStatusBadge(doc.status)}
                  </div>
                  
                  <div className="flex-1 relative z-10">
                    <h3 className="font-bold text-slate-100 text-lg mb-1 line-clamp-1 group-hover:text-indigo-300 transition-colors">{doc.original_filename}</h3>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-4">
                      {doc.document_type ? doc.document_type.replace('_', ' ') : 'Unknown'}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-auto border-t border-white/5 pt-4">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Confidence</p>
                        <p className="text-sm text-slate-200">{resData?.confidence ? `${(resData.confidence * 100).toFixed(0)}%` : '-'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Uploaded</p>
                        <p className="text-sm text-slate-200">{new Date(doc.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3 mt-5 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 text-xs text-slate-300 font-bold">
                        {(doc.file_size / 1024) > 1024 
                          ? `${(doc.file_size / (1024 * 1024)).toFixed(1)} MB` 
                          : `${(doc.file_size / 1024).toFixed(0)} KB`}
                      </div>
                      <button 
                        onClick={(e) => handleDelete(e, doc.id, doc.original_filename)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors hover:bg-rose-500/10 rounded-lg"
                        title="Delete Document"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/app/dashboard?documentId=${doc.id}`); }}
                        className="flex-1 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white py-2 rounded-xl text-sm font-medium transition-all duration-300 text-center border border-indigo-500/20 hover:border-transparent flex items-center justify-center gap-1.5 shadow-sm hover:shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                        title="Ask AI"
                      >
                        Ask AI
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/app/documents/${doc.id}`); }}
                        className="flex-1 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white py-2 rounded-xl text-sm font-medium transition-all duration-300 text-center border border-emerald-500/20 hover:border-transparent flex items-center justify-center gap-1.5 shadow-sm hover:shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                      >
                        <Eye size={16} /> View
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {loading && documents.length > 0 && (
           <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px] flex items-center justify-center z-20 rounded-3xl">
              <Loader2 size={40} className="animate-spin text-indigo-500 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
           </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center glass-panel p-4 rounded-xl">
          <p className="text-sm text-slate-400">
            Showing <span className="font-medium text-slate-100">{(page - 1) * limit + 1}</span> to <span className="font-medium text-slate-100">{Math.min(page * limit, totalCount)}</span> of <span className="font-medium text-slate-100">{totalCount}</span> results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
