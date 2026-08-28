import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listDocuments, deleteDocument } from '../services/documentService';
import useDebounce from '../hooks/useDebounce';
import { Search, Filter, Trash2, File, CheckCircle2, Clock, XCircle, UploadCloud, ChevronLeft, ChevronRight, Loader2, ArrowUpDown } from 'lucide-react';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const limit = 20;

  const navigate = useNavigate();

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

  const handleArchive = async (e, id, filename) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to archive "${filename}"?`)) {
      try {
        await deleteDocument(id);
        // Optimistic UI update
        setDocuments(docs => docs.filter(d => d.id !== id));
        setTotalCount(c => c - 1);
      } catch (err) {
        console.error(err);
        alert('Failed to archive document. Please try again.');
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
          <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
          <p className="text-gray-500 mt-1">Manage and search through your processed files.</p>
        </div>
        <Link 
          to="/app/upload" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 shrink-0"
        >
          <UploadCloud size={18} />
          Upload Document
        </Link>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col lg:flex-row gap-4 justify-between items-center z-10 relative">
        <div className="w-full lg:w-1/3 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search filenames..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
          />
        </div>

        <div className="w-full lg:w-auto flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 transition-colors hover:bg-white hover:border-blue-200">
            <Filter size={16} className="text-gray-400" />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer w-full"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
              <option value="uploaded">Uploaded</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 transition-colors hover:bg-white hover:border-blue-200">
            <Filter size={16} className="text-gray-400" />
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer w-full"
            >
              <option value="">All Types</option>
              <option value="invoice">Invoice</option>
              <option value="receipt">Receipt</option>
              <option value="contract">Contract</option>
              <option value="purchase_order">Purchase Order</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 transition-colors hover:bg-white hover:border-blue-200">
            <ArrowUpDown size={16} className="text-gray-400" />
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer w-full"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[400px]">
        {loading && documents.length === 0 ? (
           <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
             <Loader2 size={32} className="animate-spin text-blue-600" />
           </div>
        ) : error ? (
           <div className="p-12 text-center text-red-600">
             <p>{error}</p>
             <button onClick={fetchDocs} className="mt-4 px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors">Retry</button>
           </div>
        ) : documents.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <File size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              {search || statusFilter || typeFilter ? "Try adjusting your filters to find what you're looking for." : "You haven't uploaded any documents yet."}
            </p>
            {!(search || statusFilter || typeFilter) && (
              <Link to="/app/upload" className="mt-6 inline-block text-blue-600 font-medium hover:text-blue-700">Go to Upload</Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Document</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Classification</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Confidence</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Uploaded</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {documents.map((doc) => {
                  // Handle PostgREST's return structure which could be an array of joined tables or single object
                  const resData = Array.isArray(doc.document_results) ? doc.document_results[0] : doc.document_results;
                  
                  return (
                    <tr 
                      key={doc.id} 
                      onClick={() => navigate(`/app/documents/${doc.id}`)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                            <File size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">{doc.original_filename}</p>
                            <p className="text-xs text-gray-500">{(doc.file_size / 1024).toFixed(0)} KB</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                        {doc.document_type ? doc.document_type.replace('_', ' ') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(doc.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {resData?.confidence ? `${(resData.confidence * 100).toFixed(0)}%` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button 
                          onClick={(e) => handleArchive(e, doc.id, doc.original_filename)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Archive Document"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {loading && documents.length > 0 && (
           <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
              <Loader2 size={32} className="animate-spin text-blue-600" />
           </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-900">{(page - 1) * limit + 1}</span> to <span className="font-medium text-gray-900">{Math.min(page * limit, totalCount)}</span> of <span className="font-medium text-gray-900">{totalCount}</span> results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
