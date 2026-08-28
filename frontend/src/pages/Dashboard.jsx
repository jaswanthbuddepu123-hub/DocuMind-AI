import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { getStats, listDocuments, chatWithDocument, getChatHistory, getGraphStats } from '../services/documentService';
import { FileText, CheckCircle2, Clock, XCircle, UploadCloud, ChevronRight, File, BarChart3, MessageSquare, Send, Loader2, Bot, User, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, completed: 0, processing: 0, failed: 0 });
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [realChartData, setRealChartData] = useState([]);
  
  // Chat state
  const location = useLocation();
  const [chatMessages, setChatMessages] = useState([{ role: 'ai', content: 'Hello! Select a document and ask me anything about it.' }]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [chatDocumentId, setChatDocumentId] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [allDocs, setAllDocs] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, docsData, graphData] = await Promise.all([
          getStats(),
          listDocuments({ sort: 'desc', page: 1 }),
          getGraphStats()
        ]);
        setStats(statsData);
        setRecentDocs((docsData.data || []).slice(0, 5));
        setAllDocs(docsData.data || []);
        
        // Check query params for documentId
        const params = new URLSearchParams(location.search);
        const docId = params.get('documentId');
        if (docId) setChatDocumentId(docId);
        
        setRealChartData(graphData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please check your connection or try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [location.search]);

  useEffect(() => {
    // Left empty since we moved AI chat to FloatingAIAssistant
  }, [chatDocumentId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    // Handled in FloatingAIAssistant
  };

  const renderMessageContent = (content) => {
    // Handled in FloatingAIAssistant
    return null;
  };

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

  // Use real data from the backend
  const chartData = realChartData.length > 0 ? realChartData : [
    { name: 'Mon', processed: 0, failed: 0 },
    { name: 'Tue', processed: 0, failed: 0 },
    { name: 'Wed', processed: 0, failed: 0 },
    { name: 'Thu', processed: 0, failed: 0 },
    { name: 'Fri', processed: 0, failed: 0 },
    { name: 'Sat', processed: 0, failed: 0 },
    { name: 'Sun', processed: 0, failed: 0 }
  ];

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

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 size={20} className="text-indigo-600" />
              Processing Volume (Last 7 Days)
            </h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProcessed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="processed" name="Processed" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorProcessed)" />
                <Area type="monotone" dataKey="failed" name="Failed" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorFailed)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle2 size={20} className="text-green-600" />
            Success Rate
          </h2>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="#f3f4f6" strokeWidth="12" fill="none" />
                <circle 
                  cx="80" cy="80" r="70" 
                  stroke="#10b981" 
                  strokeWidth="12" 
                  fill="none" 
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={hasDocuments ? `${2 * Math.PI * 70 * (1 - (stats.completed / ((stats.completed + stats.failed) || 1)))}` : `${2 * Math.PI * 70}`}
                  className="transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-bold text-gray-900">
                  {hasDocuments ? Math.round((stats.completed / ((stats.completed + stats.failed) || 1)) * 100) : 0}%
                </span>
              </div>
            </div>
            <p className="text-gray-500 mt-6 text-center text-sm">
              {hasDocuments ? 'Documents processed successfully without errors.' : 'Upload documents to see your success rate.'}
            </p>
          </div>
        </div>
      </div>

      {/* AI Chat Assistant moved to right side globally */}

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
