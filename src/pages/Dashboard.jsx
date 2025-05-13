import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import MainFeature from '../components/MainFeature';
import { AuthContext } from '../App';
import getIcon from '../utils/iconUtils';
import { fetchTaskStats } from '../services/taskService';

function Dashboard({ darkMode, toggleDarkMode }) {
  // Declare icon components
  const SunIcon = getIcon('Sun');
  const MoonIcon = getIcon('Moon');
  const CheckCircleIcon = getIcon('CheckCircle');
  const BellIcon = getIcon('Bell');
  const LayersIcon = getIcon('Layers');
  const CalendarIcon = getIcon('Calendar');
  const LogOutIcon = getIcon('LogOut');
  const UserIcon = getIcon('User');
  
  const { logout } = useContext(AuthContext);
  const { user } = useSelector((state) => state.user);

  // Stats for dashboard
  const [stats, setStats] = useState({
    completed: 0,
    pending: 0,
    upcoming: 0
  });
  
  // Fetch task stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsData = await fetchTaskStats();
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast.error("Failed to load dashboard stats");
      }
    };
    
    loadStats();
  }, []);

  // Page transition animation
  const pageVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1, transition: { duration: 0.3 } },
    out: { opacity: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-surface-800 shadow-sm border-b border-surface-200 dark:border-surface-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayersIcon className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-primary dark:text-primary-light">TaskFlow</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-surface-600 dark:text-surface-300 hidden md:flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                <span>{user?.firstName || 'User'}</span>
              </div>
              
              <button
                onClick={() => toast.info("Notifications feature coming soon!")}
                className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                aria-label="Notifications"
              >
                <BellIcon className="h-5 w-5 text-surface-600 dark:text-surface-400" />
              </button>
              
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? (
                  <SunIcon className="h-5 w-5 text-yellow-400" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-surface-600" />
                )}
              </button>
              
              <button
                onClick={logout}
                className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                aria-label="Log out"
              >
                <LogOutIcon className="h-5 w-5 text-surface-600 dark:text-surface-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {/* Dashboard Stats */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Completed Tasks Card */}
            <div className="card p-5 border-l-4 border-l-green-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-surface-500 dark:text-surface-400">Completed Tasks</p>
                  <p className="text-2xl font-bold mt-1">{stats.completed}</p>
                </div>
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </div>
            
            {/* Pending Tasks Card */}
            <div className="card p-5 border-l-4 border-l-amber-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-surface-500 dark:text-surface-400">Pending Tasks</p>
                  <p className="text-2xl font-bold mt-1">{stats.pending}</p>
                </div>
                <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <LayersIcon className="h-6 w-6 text-amber-500" />
                </div>
              </div>
            </div>
            
            {/* Upcoming Tasks Card */}
            <div className="card p-5 border-l-4 border-l-blue-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-surface-500 dark:text-surface-400">Upcoming Tasks</p>
                  <p className="text-2xl font-bold mt-1">{stats.upcoming}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <CalendarIcon className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Main Feature */}
        <section>
          <MainFeature />
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700 py-4">
        <div className="container mx-auto px-4 text-center text-surface-500 dark:text-surface-400 text-sm">
          <p>&copy; {new Date().getFullYear()} TaskFlow. All rights reserved.</p>
        </div>
      </footer>
    </motion.div>
  );
}

export default Dashboard;