import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Bell, Search, Menu, LogOut, BarChart3, Sparkles, Lock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import AISettings from '../../pages/ppt-editor/components/AISettings';
import CountdownTimer from '../common/CountdownTimer';

const AI_PASSWORD = 'easywork';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
  onMenuClick?: () => void;
  onToggleSidebar?: () => void;
}

export default function Navbar({ isDark, toggleTheme, onMenuClick, onToggleSidebar }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAISettings, setShowAISettings] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showPasswordModal && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [showPasswordModal]);

  const handleOpenAISettings = () => {
    setShowPasswordModal(true);
    setPasswordInput('');
    setPasswordError('');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === AI_PASSWORD) {
      setShowPasswordModal(false);
      setPasswordInput('');
      setPasswordError('');
      setShowAISettings(true);
    } else {
      setPasswordError('密码错误，请重新输入');
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-white/70 dark:bg-surface-900/70 backdrop-blur-xl border-b border-gray-200/80 dark:border-white/[0.06] supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-surface-900/60">
        <div className="flex items-center justify-between h-full px-4 md:px-6">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="打开菜单"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onToggleSidebar}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-btn bg-primary-600 flex items-center justify-center shadow-sm">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white hidden sm:block tracking-tight">
                EasyWork工作台
              </span>
            </motion.button>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center">
              <CountdownTimer />
            </div>
            <div className="hidden md:flex items-center bg-surface-100 dark:bg-surface-800/60 rounded-btn px-3 py-1.5 ring-1 ring-transparent focus-within:ring-primary-500/30 focus-within:bg-white dark:focus-within:bg-surface-800 transition-all">
              <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="搜索..."
                className="bg-transparent border-none outline-none text-sm ml-2 w-40 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleOpenAISettings}
              className="p-2 rounded-btn hover:bg-surface-100 dark:hover:bg-white/[0.06] transition-colors"
              title="AI 模型配置"
            >
              <Sparkles className="w-5 h-5 text-purple-500" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-btn hover:bg-surface-100 dark:hover:bg-white/[0.06] transition-colors"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              )}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              className="relative p-2 rounded-btn hover:bg-surface-100 dark:hover:bg-white/[0.06] transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full ring-2 ring-white dark:ring-surface-900" />
            </motion.button>

            <div className="relative" ref={menuRef}>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center cursor-pointer ring-2 ring-transparent hover:ring-primary-500/30 transition-all"
              >
                <span className="text-white text-xs font-medium">
                  {user?.username ? user.username.slice(0, 2).toUpperCase() : 'Admin'}
                </span>
              </motion.button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-800 rounded-card border border-gray-100 dark:border-white/[0.06] shadow-float dark:shadow-float-dark py-2 z-50"
                  >
                    <div className="px-4 py-2.5 border-b border-gray-100 dark:border-white/[0.06]">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {user?.username || 'Admin'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">管理员</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-surface-50 dark:hover:bg-white/[0.04] transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      退出登录
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>
      {/* 密码验证弹窗 */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-sm mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-purple-500" />
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">访问验证</h2>
                </div>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handlePasswordSubmit} className="p-5 space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  请输入密码以访问 AI 模型配置
                </p>

                <div>
                  <input
                    ref={passwordInputRef}
                    type="password"
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    placeholder="请输入密码"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {passwordError && (
                  <p className="text-xs text-red-500">{passwordError}</p>
                )}

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
                  >
                    确认
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showAISettings && <AISettings onClose={() => setShowAISettings(false)} />}
    </>
  );
}
