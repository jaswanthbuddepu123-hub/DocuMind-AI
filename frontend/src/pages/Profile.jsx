import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getStats } from '../services/documentService';
import { User, Mail, Calendar, Shield, LogOut, CheckCircle2, Clock, XCircle, FileText, Settings, RefreshCw, Moon, Sun } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [stats, setStats] = useState({ total: 0, completed: 0, processing: 0, failed: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const statsData = await getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="pb-10 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-600 to-indigo-700"></div>
            
            <div className="relative mt-8 mb-4">
              <div className="w-28 h-28 bg-white rounded-full mx-auto p-1.5 shadow-md">
                <div className="w-full h-full bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl font-bold">
                  {getInitials(user?.name)}
                </div>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900">{user?.name || 'User'}</h2>
            <p className="text-gray-500 text-sm mb-6 flex items-center justify-center gap-1.5 mt-1">
              <Mail size={14} /> {user?.email}
            </p>

            <div className="flex flex-col gap-3">
              <button onClick={fetchStats} className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm">
                <RefreshCw size={16} className={loading ? "animate-spin text-blue-600" : ""} />
                Refresh Profile
              </button>
              <button onClick={logout} className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm">
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield size={20} className="text-indigo-600" />
              Security Status
            </h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                 <span className="text-gray-600 text-sm">Authentication</span>
                 <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">Active Session</span>
               </div>
               <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                 <span className="text-gray-600 text-sm">Role</span>
                 <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">Standard User</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-gray-600 text-sm flex items-center gap-2"><Calendar size={14}/> Joined</span>
                 <span className="text-gray-900 text-sm font-medium">
                   {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}
                 </span>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stats & Preferences */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Statistics Grid */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText size={20} className="text-blue-600" />
              Account Statistics
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                <p className="text-sm font-medium text-gray-500 mb-1">Total Documents</p>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-gray-900">{loading ? '-' : stats.total}</span>
                  <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><FileText size={16}/></div>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-100 p-4 rounded-2xl">
                <p className="text-sm font-medium text-green-700 mb-1">Successfully Processed</p>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-green-900">{loading ? '-' : stats.completed}</span>
                  <div className="p-1.5 bg-green-200 text-green-700 rounded-lg"><CheckCircle2 size={16}/></div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                <p className="text-sm font-medium text-gray-500 mb-1">Processing</p>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-gray-900">{loading ? '-' : stats.processing}</span>
                  <div className="p-1.5 bg-gray-200 text-gray-700 rounded-lg"><Clock size={16}/></div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-100 p-4 rounded-2xl">
                <p className="text-sm font-medium text-red-700 mb-1">Failed</p>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-red-900">{loading ? '-' : stats.failed}</span>
                  <div className="p-1.5 bg-red-200 text-red-700 rounded-lg"><XCircle size={16}/></div>
                </div>
              </div>
            </div>

            {/* Progress bar showing success rate */}
            {!loading && stats.total > 0 && (
              <div className="mt-8">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">Success Rate</span>
                  <span className="font-bold text-green-600">{Math.round((stats.completed / stats.total) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden flex">
                  <div className="bg-green-500 h-2.5" style={{ width: `${(stats.completed / stats.total) * 100}%` }}></div>
                  <div className="bg-gray-300 h-2.5" style={{ width: `${(stats.processing / stats.total) * 100}%` }}></div>
                  <div className="bg-red-500 h-2.5" style={{ width: `${(stats.failed / stats.total) * 100}%` }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Settings size={20} className="text-gray-700" />
              Preferences
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Theme Preference</h4>
                  <p className="text-sm text-gray-500">Toggle between light and dark mode</p>
                </div>
                <button 
                  onClick={toggleTheme}
                  className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors"
                >
                  {theme === 'light' ? <Moon size={20} className="text-gray-700"/> : <Sun size={20} className="text-amber-500"/>}
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Email Notifications</h4>
                  <p className="text-sm text-gray-500">Receive alerts when processing finishes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Compact View</h4>
                  <p className="text-sm text-gray-500">Show more documents per page in lists</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" value="" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Profile;
