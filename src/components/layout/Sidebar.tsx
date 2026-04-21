import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  TrendingUp,
  Users,
  Wifi,
  Gift,
  Network,
  ChevronLeft,
  ChevronRight,
  X,
  Smartphone,
  BarChart3,
  CalendarCheck,
  FileEdit,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

const menuItems: MenuItem[] = [
  { id: 'home', label: '首页', icon: Home, path: '/home' },
  { id: 'sales-revenue', label: '销售收入', icon: TrendingUp, path: '/sales-revenue' },
  { id: 'customer-acquisition', label: '客户新增', icon: Users, path: '/customer-acquisition' },
  { id: 'broadband', label: '宽带新增', icon: Wifi, path: '/broadband' },
  { id: 'smart-home', label: '智家产品', icon: Smartphone, path: '/smart-home' },
  { id: 'rights-products', label: '权益产品', icon: Gift, path: '/rights-products' },
  { id: 'home-networking', label: '家庭组网', icon: Network, path: '/home-networking' },
  { id: 'week-review', label: '周四复盘', icon: CalendarCheck, path: '/week-review' },
  { id: 'ppt-editor', label: '撰写PPT', icon: FileEdit, path: '/ppt-editor' },
];

interface SidebarProps {
  visible: boolean;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ visible, collapsed, onToggleCollapsed, mobileOpen = false, onMobileClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/home') {
      return location.pathname === '/home';
    }
    return location.pathname.startsWith(path);
  };

  // Close mobile drawer on route change
  useEffect(() => {
    if (mobileOpen && onMobileClose) {
      onMobileClose();
    }
  }, [location.pathname]);

  const handleNavigate = (path: string) => {
    navigate(path);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full py-4">
      <nav className="flex-1 px-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.path)}
              className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-medium transition-colors relative ${
                active
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-900/10'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-surface-100 dark:hover:bg-white/[0.04]'
              }`}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary-500 rounded-r-full" />
              )}
              <Icon className="w-5 h-5 flex-shrink-0 ml-0.5" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {collapsed && (
                <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg pointer-events-none">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-2 hidden md:block">
        <button
          onClick={onToggleCollapsed}
          className="w-full flex items-center justify-center p-2 rounded-btn hover:bg-surface-100 dark:hover:bg-white/[0.04] transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex fixed left-0 top-16 bottom-0 z-30 bg-white dark:bg-surface-900 border-r border-gray-200/80 dark:border-white/[0.06] transition-all duration-300 ease-out ${
          collapsed ? 'w-16' : 'w-56'
        }`}
        style={{
          transform: visible ? 'translateX(0)' : 'translateX(-14rem)',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={onMobileClose}
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-white dark:bg-surface-900 border-r border-gray-200/80 dark:border-white/[0.06] shadow-float dark:shadow-float-dark"
            >
              <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200/80 dark:border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-btn bg-primary-600 flex items-center justify-center shadow-sm">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    菜单
                  </span>
                </div>
                <button
                  onClick={onMobileClose}
                  className="p-2 rounded-btn hover:bg-surface-100 dark:hover:bg-white/[0.06] transition-colors"
                  aria-label="关闭菜单"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {sidebarContent}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
