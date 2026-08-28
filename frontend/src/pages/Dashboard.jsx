import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStats, listDocuments } from '../services/documentService';
import { FileText, CheckCircle2, Clock, XCircle, UploadCloud, ChevronRight, File } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, completed: 0, processing: 0, failed: 0 });
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, docsData] = await Promise.all([
          getStats(),
          listDocuments({ sort: 'desc', page: 1 })
        ]);
        setStats(statsData);
        // Ensure we only show top 5 in recent list
        setRecentDocs((docsData.data || []).slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please check your connection or try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1.5"><CheckCircle2 size={14} /> Completed</span>;
      case 'failed':
        return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full flex items-center gap-1.5"><XCircle size={14} /> Failed</span>;
      case 'processing':
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full flex items-center gap-1.5 animate-pulse"><Clock size={14} /> Processing</span>;
      case 'uploaded':
      default:
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex items-center gap-1.5"><UploadCloud size={14} /> Uploaded</span>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-32 animate-pulse flex flex-col justify-between">
               <div className="h-4 w-24 bg-gray-200 rounded"></div>
               <div className="h-8 w-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <div className="h-6 w-40 bg-gray-200 rounded mb-6 animate-pulse"></div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
             {[1, 2, 3].map(i => (
               <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"></div>
             ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100">
        <h3 className="font-semibold text-lg">Oops!</h3>
        <p>{error}</p>
      </div>
    );
  }

  const hasDocuments = stats.total > 0;

  return (
    <div className="pb-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome to DocuMind AI Document Intelligence</p>
        </div>
        <Link 
          to="/app/upload" 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-blue-500/20"
        >
          <UploadCloud size={18} />
          Upload Document
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform"><FileText size={20} /></div>
            <span className="font-medium text-sm">Total Documents</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-4">{stats.total}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:scale-110 transition-transform"><CheckCircle2 size={20} /></div>
            <span className="font-medium text-sm">Completed</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-4">{stats.completed}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <div className="p-2 bg-gray-50 text-gray-600 rounded-lg group-hover:scale-110 transition-transform"><Clock size={20} /></div>
            <span className="font-medium text-sm">Processing</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-4">{stats.processing}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:scale-110 transition-transform"><XCircle size={20} /></div>
            <span className="font-medium text-sm">Failed</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-4">{stats.failed}</p>
        </div>
      </div>

      {/* Recent Documents */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Documents</h2>
          {hasDocuments && (
            <Link to="/app/documents" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center transition-colors">
              View all <ChevronRight size={16} />
            </Link>
          )}
        </div>

        {hasDocuments ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {recentDocs.map((doc) => (
                <li key={doc.id}>
                  <Link to={`/app/documents/${doc.id}`} className="flex items-center p-4 hover:bg-gray-50 transition-colors group">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                      <File size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">{doc.original_filename}</h4>
                      <p className="text-xs text-gray-500 mt-1 capitalize">
                        {doc.document_type ? doc.document_type.replace('_', ' ') : 'Unknown Type'} • {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      {getStatusBadge(doc.status)}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center hover:border-blue-300 transition-colors">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No documents yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Upload your first document to extract insights and intelligent data automatically.
            </p>
            <Link 
              to="/app/upload" 
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-md shadow-blue-500/20"
            >
              <UploadCloud size={20} />
              Upload First Document
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
