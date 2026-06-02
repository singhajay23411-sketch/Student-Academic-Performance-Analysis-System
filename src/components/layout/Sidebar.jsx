import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import useStore from '../../store/useStore';

const navItems = [
  { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { path: '/analytics', icon: 'analytics', label: 'Performance Analysis' },
  { path: '/planner', icon: 'calendar_month', label: 'Study Planner' },
  { path: '/progress', icon: 'monitoring', label: 'Progress Tracking' },
  { path: '/settings', icon: 'settings', label: 'Settings' },
];

export default function Sidebar() {
  const profile = useStore((state) => state.profile);
  const logout = useStore((state) => state.logout);
  return (
    <aside className="h-screen w-64 fixed left-0 top-0 flex flex-col py-xl px-sm border-r border-outline-variant bg-surface dark:bg-on-background z-50">
      <div className="px-md mb-xl">
        <h1 className="font-display-lg text-headline-md font-bold text-primary dark:text-primary-fixed">SAPAS</h1>
        <p className="font-body-md text-body-sm text-on-surface-variant opacity-70 tracking-wider uppercase">Student Analytics</p>
      </div>

      <nav className="flex-1 flex flex-col gap-xs overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-sm px-md py-sm rounded-xl font-body-md transition-all scale-95 hover:scale-100 ${
                isActive
                  ? 'bg-primary-container text-on-primary-container font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-high dark:hover:bg-surface-variant hover:text-primary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-outline-variant pt-md">
        <div className="flex items-center gap-sm px-md py-sm mb-sm">
          <img src={profile.avatar} alt="Profile" className="w-8 h-8 rounded-full border border-primary-fixed object-cover" />
          <div className="flex flex-col overflow-hidden">
            <span className="text-body-sm font-bold text-on-surface truncate">{profile.fullName}</span>
            <span className="text-[10px] text-on-surface-variant uppercase truncate">{profile.role}</span>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-sm px-md py-sm text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-xl transition-all scale-95 hover:scale-100 font-body-md"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
