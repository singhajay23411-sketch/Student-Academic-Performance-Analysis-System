import { useLocation } from 'react-router-dom';
import useStore from '../../store/useStore';

const pageTitles = {
  '/dashboard': '',
  '/analytics': 'Performance Analysis',
  '/planner': 'Study Planner',
  '/progress': 'Progress Tracking',
  '/settings': 'Settings',
};

export default function Header() {
  const location = useLocation();
  const profile = useStore((state) => state.profile);  const title = pageTitles[location.pathname] || '';

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-256px)] z-40 bg-surface/70 dark:bg-on-background/70 backdrop-blur-md flex justify-between items-center px-xl py-md">
      <div className="flex items-center gap-md flex-1 max-w-xl">
        {title && (
          <h2 className="font-headline-md text-headline-md text-primary dark:text-primary-fixed mr-md whitespace-nowrap">
            {title}
          </h2>
        )}
        <div className="relative w-full group focus-within:ring-2 focus-within:ring-primary/20 rounded-full transition-all">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
            search
          </span>
          <input
            className="w-full bg-surface-container-low border border-transparent focus:border-primary/20 rounded-full pl-xl pr-md py-xs text-body-sm focus:outline-none transition-all"
            placeholder={title === 'Study Planner' ? "Search tasks..." : title === 'Progress Tracking' ? "Search milestones..." : "Search insights..."}
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-md">
        <button className="text-on-surface-variant hover:text-primary transition-all relative p-base rounded-full hover:bg-surface-container-high">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
        </button>
        <button className="text-on-surface-variant hover:text-primary transition-all p-base rounded-full hover:bg-surface-container-high">
          <span className="material-symbols-outlined">help</span>
        </button>
        
        <div className="h-8 w-px bg-outline-variant mx-xs"></div>
        
        <div className="flex items-center gap-sm cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="font-label-md text-body-sm font-bold text-on-surface group-hover:text-primary transition-colors">{profile.fullName}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{profile.role}</p>
          </div>
          <img
            alt="Profile Image"
            className="w-10 h-10 rounded-full border-2 border-primary-fixed object-cover"
            src={profile.avatar}
          />
        </div>
      </div>
    </header>
  );
}
