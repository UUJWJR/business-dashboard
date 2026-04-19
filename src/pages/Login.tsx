import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, User, Lock, AlertCircle, Sun, Moon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (!username.trim() || !password.trim()) {
        setError('请输入用户名和密码');
        return;
      }

      setIsLoading(true);

      timeoutRef.current = setTimeout(() => {
        const success = login(username, password);
        if (success) {
          navigate('/', { replace: true });
        } else {
          setError('用户名或密码错误');
        }
        setIsLoading(false);
      }, 300);
    },
    [username, password, login, navigate]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-card p-8 border border-gray-100 dark:border-gray-700 shadow-card dark:shadow-card-dark"
      >
        <button
          type="button"
          onClick={toggleTheme}
          className="absolute top-4 right-4 p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={isDark ? '切换到浅色模式' : '切换到深色模式'}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-4">
            <LogIn className="w-7 h-7 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            欢迎登录
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            请输入您的账号和密码
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              用户名
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              密码
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              role="alert"
              aria-live="polite"
              className="flex items-center gap-2 text-sm text-danger-600 dark:text-danger-400 bg-danger-50 dark:bg-danger-900/20 px-3 py-2 rounded-lg"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-500 text-white font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? '登录中...' : '登录'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
