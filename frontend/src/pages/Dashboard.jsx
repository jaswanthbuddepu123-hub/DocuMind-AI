import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
            <div key={i} className="glass-panel p-6 rounded-2xl h-32 animate-pulse flex flex-col justify-between">
               <div className="h-4 w-24 bg-white/10 rounded"></div>
               <div className="h-8 w-16 bg-white/10 rounded"></div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <div className="h-6 w-40 bg-white/10 rounded mb-6 animate-pulse"></div>
          <div className="glass-panel p-4 space-y-4">
             {[1, 2, 3].map(i => (
               <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse"></div>
             ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 glass-panel bg-red-500/10 text-red-400 border-red-500/20">
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 relative z-10 pt-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
            Dashboard
            <div className="px-3 py-1 bg-indigo-500/20 rounded-full border border-indigo-500/30 text-xs text-indigo-300 font-bold tracking-widest uppercase">
              Live
            </div>
          </h1>
          <p className="text-lg text-slate-400 font-medium">Welcome to DocuMind AI Document Intelligence</p>
        </div>
        <Link 
          to="/app/upload" 
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(99,102,241,0.7)] group"
        >
          <UploadCloud size={20} className="group-hover:scale-110 transition-transform" />
          Upload Document
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 relative z-10">
        {[
          { title: 'Total Documents', value: stats.total, icon: FileText, color: 'indigo', status: '' },
          { title: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'emerald', status: 'completed' },
          { title: 'Processing', value: stats.processing, icon: Clock, color: 'amber', status: 'processing' },
          { title: 'Failed', value: stats.failed, icon: XCircle, color: 'rose', status: 'failed' }
        ].map((stat, i) => (
          <div 
            key={i} 
            onClick={() => navigate(stat.status ? `/app/documents?status=${stat.status}` : '/app/documents')}
            className="glass-card p-6 rounded-[2rem] group relative overflow-hidden flex flex-col justify-between h-40 cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all"
          >
            <div className={`absolute -right-6 -top-6 w-32 h-32 bg-${stat.color}-500/20 rounded-full mix-blend-screen filter blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            
            <div className="flex items-center gap-3 text-slate-400 mb-2 relative z-10">
              <div className={`p-3 bg-${stat.color}-500/10 text-${stat.color}-400 rounded-2xl group-hover:scale-110 group-hover:bg-${stat.color}-500 group-hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.1)] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]`}>
                <stat.icon size={24} />
              </div>
              <span className="font-semibold tracking-wide uppercase text-xs">{stat.title}</span>
            </div>
            <p className="text-5xl font-black text-white mt-4 relative z-10 group-hover:translate-x-2 transition-transform duration-300">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12 relative z-10">
        <div className="lg:col-span-2 glass-panel p-8 rounded-[2.5rem]">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-xl"><BarChart3 size={20} className="text-indigo-400" /></div>
              Processing Volume
            </h2>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg">Last 7 Days</div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProcessed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="processed" name="Processed" stroke="#818cf8" strokeWidth={4} fillOpacity={1} fill="url(#colorProcessed)" />
                <Area type="monotone" dataKey="failed" name="Failed" stroke="#f87171" strokeWidth={4} fillOpacity={1} fill="url(#colorFailed)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-[2.5rem] flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full mix-blend-screen filter blur-[60px] pointer-events-none"></div>
          <h2 className="text-xl font-bold text-slate-100 mb-8 flex items-center gap-3 relative z-10">
            <div className="p-2 bg-emerald-500/20 rounded-xl"><CheckCircle2 size={20} className="text-emerald-400" /></div>
            Success Rate
          </h2>
          <div className="flex-1 flex flex-col items-center justify-center relative z-10">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="80" stroke="rgba(255,255,255,0.05)" strokeWidth="16" fill="none" />
                <circle 
                  cx="96" cy="96" r="80" 
                  stroke="url(#successGradient)" 
                  strokeWidth="16" 
                  fill="none" 
                  strokeDasharray={`${2 * Math.PI * 80}`}
                  strokeDashoffset={hasDocuments ? `${2 * Math.PI * 80 * (1 - (stats.completed / ((stats.completed + stats.failed) || 1)))}` : `${2 * Math.PI * 80}`}
                  className="transition-all duration-1500 ease-out drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-5xl font-black text-white">
                  {hasDocuments ? Math.round((stats.completed / ((stats.completed + stats.failed) || 1)) * 100) : 0}<span className="text-2xl text-emerald-400">%</span>
                </span>
              </div>
            </div>
            <p className="text-slate-400 mt-8 text-center text-sm font-medium leading-relaxed max-w-[200px]">
              {hasDocuments ? 'Documents processed successfully without errors.' : 'Upload documents to see your success rate.'}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Documents */}
      <div className="relative z-10">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Clock size={24} className="text-indigo-400" />
            Recent Documents
          </h2>
          {hasDocuments && (
            <Link to="/app/documents" className="px-4 py-2 bg-white/5 hover:bg-white/10 text-indigo-300 hover:text-indigo-200 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors border border-white/10">
              View all <ChevronRight size={16} />
            </Link>
          )}
        </div>

        {hasDocuments ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {recentDocs.map((doc, i) => (
                <Link key={doc.id} to={`/app/documents/${doc.id}`} className="glass-card rounded-2xl p-5 group flex flex-col" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                        <File size={20} />
                      </div>
                      <div className="scale-90 origin-top-right">{getStatusBadge(doc.status)}</div>
                    </div>
                    <div className="flex-1 mt-2">
                      <h4 className="text-sm font-bold text-slate-100 truncate group-hover:text-indigo-300 transition-colors mb-1">{doc.original_filename}</h4>
                      <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold mt-auto pt-2">
                        {doc.document_type ? doc.document_type.replace('_', ' ') : 'Unknown'}
                      </p>
                    </div>
                </Link>
              ))}
          </div>
        ) : (
          <div className="glass-panel border-dashed p-16 text-center hover:border-indigo-500/50 transition-colors rounded-[2.5rem]">
            <div className="w-20 h-20 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
              <FileText size={40} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">No documents yet</h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto text-lg">
              Upload your first document to extract insights and intelligent data automatically.
            </p>
            <Link 
              to="/app/upload" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:-translate-y-1"
            >
              <UploadCloud size={24} />
              Upload First Document
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
