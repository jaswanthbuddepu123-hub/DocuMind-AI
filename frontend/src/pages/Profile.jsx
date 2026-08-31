import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getStats } from '../services/documentService';
import { User, Mail, Calendar, Shield, LogOut, CheckCircle2, Clock, XCircle, FileText, Settings, RefreshCw, Moon, Sun, Edit3, Phone, Camera, Save } from 'lucide-react';
import FilerobotImageEditor, { TABS, TOOLS } from 'react-filerobot-image-editor';
import { dataURLtoFile } from '../utils/fileUtils';

const SignOutModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative bg-slate-900 border border-white/10 rounded-3xl shadow-[0_0_60px_rgba(239,68,68,0.15)] p-8 w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-red-500/20 rounded-full blur-[60px] pointer-events-none" />
      <div className="flex flex-col items-center text-center relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <LogOut size={28} className="text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Sign Out?</h2>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          Are you sure you want to sign out of <span className="text-indigo-400 font-semibold">DocuMind</span>? You'll need to log in again to access your documents.
        </p>
        <div className="flex gap-3 w-full">
          <button onClick={onCancel} className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white rounded-2xl font-medium text-sm transition-all duration-200">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-3 px-4 bg-red-500/10 hover:bg-red-500 border border-red-500/30 hover:border-transparent text-red-400 hover:text-white rounded-2xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]">
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  </div>
);

const Profile = () => {
  const { user, logout, updateProfile } = useAuth();
  const { theme, toggleTheme, isCompact, toggleCompact } = useTheme();
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [stats, setStats] = useState({ total: 0, completed: 0, processing: 0, failed: 0 });
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone_number: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);

  // Advanced Image Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorSource, setEditorSource] = useState(null);
  const [originalFilename, setOriginalFilename] = useState('avatar.jpg');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOriginalFilename(file.name);
      setEditorSource(URL.createObjectURL(file));
      setIsEditorOpen(true);
    }
    e.target.value = null; // reset so same file can be selected again
  };

  const handleEditCurrentImage = (e) => {
    e.preventDefault();
    if (avatarFile) {
      setEditorSource(URL.createObjectURL(avatarFile));
      setIsEditorOpen(true);
    } else if (user?.avatar_url) {
      setEditorSource(user.avatar_url);
      setIsEditorOpen(true);
    }
  };

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

  useEffect(() => {
    if (user) {
      setEditForm({ name: user.name || '', phone_number: user.phone_number || '' });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    const result = await updateProfile(editForm.name, editForm.phone_number, avatarFile);
    setSaving(false);
    if (result.success) {
      setIsEditing(false);
      setAvatarFile(null);
    } else {
      alert(result.error);
    }
  };

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
            
            <div className="relative mt-8 mb-4 flex flex-col items-center gap-4">
              <div className="w-28 h-28 bg-white rounded-full p-1.5 shadow-md relative shrink-0">
                {user?.avatar_url || avatarFile ? (
                  <img src={avatarFile ? URL.createObjectURL(avatarFile) : user.avatar_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl font-bold">
                    {getInitials(user?.name)}
                  </div>
                )}
              </div>
                
              {isEditing && (
                <div className="flex items-center justify-center gap-3">
                  {(user?.avatar_url || avatarFile) && (
                    <button type="button" onClick={handleEditCurrentImage} className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-full text-xs font-semibold transition-colors border border-blue-100">
                      <Edit3 size={14} />
                      Edit Photo
                    </button>
                  )}
                  <label className="cursor-pointer flex items-center gap-1.5 px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-full text-xs font-semibold transition-colors shadow-sm">
                    <Camera size={14} />
                    Upload New
                    <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
              )}
            </div>
            
            {isEditing ? (
              <div className="text-left space-y-4 mb-6">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                  <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                  <input type="text" value={editForm.phone_number} onChange={(e) => {
                    const onlyNums = e.target.value.replace(/\D/g, '');
                    setEditForm({...editForm, phone_number: onlyNums});
                  }} maxLength={10} placeholder="1234567890" className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
                  {user?.name || 'User'}
                </h2>
                <div className="text-gray-500 text-sm mb-6 flex flex-col items-center gap-2 mt-2">
                  <span className="flex items-center gap-1.5"><Mail size={14} /> {user?.email}</span>
                  {user?.phone_number && <span className="flex items-center gap-1.5"><Phone size={14} /> {user.phone_number}</span>}
                </div>
              </>
            )}

            <div className="flex flex-col gap-3">
              {isEditing ? (
                <>
                  <button onClick={handleSaveProfile} disabled={saving} className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-70">
                    {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                  <button onClick={() => { setIsEditing(false); setAvatarFile(null); }} className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl font-medium transition-colors flex items-center justify-center text-sm">
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setIsEditing(true)} className="w-full py-2.5 px-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm">
                    <Edit3 size={16} /> Edit Profile
                  </button>
                  <button onClick={() => setShowSignOutModal(true)} className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm">
                    <LogOut size={16} /> Sign Out
                  </button>
                </>
              )}
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
                   {user?.created_at ? new Date(user.created_at).toLocaleString(undefined, { 
                     year: 'numeric', 
                     month: 'short', 
                     day: 'numeric', 
                     hour: '2-digit', 
                     minute: '2-digit' 
                   }) : 'Recently'}
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
                  <input type="checkbox" checked={isCompact} onChange={toggleCompact} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Advanced Image Editor Modal */}
      {isEditorOpen && editorSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-10">
          <div className="w-full h-full max-w-6xl max-h-[800px] bg-white rounded-xl overflow-hidden shadow-2xl relative">
            <FilerobotImageEditor
              source={editorSource}
              onSave={(editedImageObject, designState) => {
                const newFile = dataURLtoFile(editedImageObject.imageBase64, `edited_${originalFilename}`);
                setAvatarFile(newFile);
                setIsEditorOpen(false);
                setEditorSource(null);
              }}
              onClose={() => {
                setIsEditorOpen(false);
                setEditorSource(null);
              }}
              annotationsCommon={{
                fill: '#000000',
              }}
              Text={{ text: 'Add Text...' }}
              translations={{
                save: 'Apply Image',
              }}
              tabsIds={[TABS.ADJUST, TABS.ANNOTATE, TABS.WATERMARK, TABS.FILTERS, TABS.FINETUNE]}
              defaultTabId={TABS.ADJUST}
              defaultToolId={TOOLS.CROP}
            />
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <SignOutModal
          onConfirm={() => { setShowSignOutModal(false); logout(); }}
          onCancel={() => setShowSignOutModal(false)}
        />
      )}
    </div>
  );
};

export default Profile;
