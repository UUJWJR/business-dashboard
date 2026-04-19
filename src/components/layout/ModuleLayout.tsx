import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface ModuleLayoutProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export default function ModuleLayout({ title, icon, children, actions }: ModuleLayoutProps) {
  const { isDark, toggleTheme } = useTheme();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 transition-colors duration-300">
      <Navbar
        isDark={isDark}
        toggleTheme={toggleTheme}
        onMenuClick={() => setMobileSidebarOpen(true)}
      />
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <main className="pt-16 pl-0 md:pl-56 transition-all duration-300">
        <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
          {/* Module title area */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-btn bg-primary-50/60 dark:bg-primary-900/15 text-primary-600 dark:text-primary-400 ring-1 ring-primary-100/60 dark:ring-primary-800/40">
                {icon}
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                {title}
              </h1>
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
