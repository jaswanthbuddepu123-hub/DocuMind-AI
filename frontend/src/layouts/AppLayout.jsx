import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, Upload, User, LayoutDashboard, LogOut } from 'lucide-react';

import FloatingAIAssistant from '../components/FloatingAIAssistant';

const AppLayout = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Documents', path: '/app/documents', icon: FileText },
    { name: 'Upload', path: '/app/upload', icon: Upload },
    { name: 'Profile', path: '/app/profile', icon: User },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden relative">
      {/* Animated Background Orbs */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-float z-0"></div>
      <div className="absolute top-40 right-20 w-80 h-80 bg-purple-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-float-delayed z-0"></div>
      <div className="absolute -bottom-40 left-1/2 w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full mix-blend-screen filter blur-[120px] animate-float-slow z-0"></div>

      <div className="flex w-full h-full p-2 md:p-4 gap-4 z-10 relative">
        {/* Floating Sidebar (Pill) */}
        <aside className="w-64 shrink-0 glass-panel rounded-3xl hidden md:flex flex-col border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] my-2 ml-2">
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.6)]">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-fuchsia-400">
              DocuMind
            </span>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-3 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-indigo-300 font-medium border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.15)] translate-x-1' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 hover:translate-x-1'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'text-slate-500'} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 mb-2 mx-4 border-t border-white/5">
            <button 
              onClick={logout}
              className="flex items-center gap-4 px-5 py-3 w-full text-left text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-2xl transition-all duration-300 group"
            >
              <LogOut size={20} className="group-hover:text-red-400" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 flex flex-col h-full overflow-hidden relative rounded-3xl my-2 mr-2">
          {/* Topbar (Mobile mainly) */}
          <header className="glass-panel p-4 flex items-center justify-between sticky top-0 z-30 md:hidden rounded-2xl mx-2 mt-2 mb-2 border border-white/10">
             <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                 <FileText className="w-4 h-4 text-white" />
               </div>
               <span className="text-lg font-bold text-slate-100">DocuMind</span>
             </div>
             <button onClick={logout} className="p-2 text-slate-400 hover:bg-white/10 rounded-xl">
               <LogOut size={20} />
             </button>
          </header>

          <div className="flex-1 overflow-auto p-4 md:p-8 rounded-3xl z-10 custom-scrollbar">
            <div className="max-w-6xl mx-auto min-h-full flex flex-col">
              <Outlet />
            </div>
          </div>
          
          {/* Mobile Bottom Navigation */}
          <nav className="md:hidden fixed bottom-4 left-4 right-4 glass-panel rounded-2xl border border-white/10 flex justify-around items-center p-2 z-40">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center p-2 min-w-[64px] rounded-xl transition-all ${
                    isActive 
                      ? 'bg-indigo-500/20 text-indigo-400' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-indigo-400 drop-shadow-[0_0_5px_rgba(99,102,241,0.5)]' : ''} />
                  <span className="text-[10px] mt-1 font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </main>
      </div>

      {/* Right AI Assistant */}
      <FloatingAIAssistant />
    </div>
  );
};

export default AppLayout;
