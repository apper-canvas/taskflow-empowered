import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useContext } from 'react';
import { AuthContext } from '../App';
import getIcon from '../utils/iconUtils';

function Login({ darkMode, toggleDarkMode }) {
  const { isInitialized } = useContext(AuthContext);
  const SunIcon = getIcon('Sun');
  const MoonIcon = getIcon('Moon');
  const LayersIcon = getIcon('Layers');

  useEffect(() => {
    if (isInitialized) {
      // Show login UI in this component
      const { ApperUI } = window.ApperSDK;
      ApperUI.showLogin("#authentication");
    }
  }, [isInitialized]);
  
  return (
    <motion.div 
      className="min-h-screen flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <header className="bg-white dark:bg-surface-800 shadow-sm border-b border-surface-200 dark:border-surface-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayersIcon className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-primary dark:text-primary-light">TaskFlow</h1>
            </div>
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
          </div>
        </div>
      </header>
      
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 p-6 bg-white dark:bg-surface-800 rounded-xl shadow-card">
          <h2 className="text-2xl font-bold text-center">Sign In</h2>
          <div id="authentication" className="min-h-[300px]"></div>
          <p className="text-center text-sm text-surface-600 dark:text-surface-300">Don't have an account? <Link to="/signup" className="text-primary hover:underline">Sign Up</Link></p>
        </div>
      </div>
    </motion.div>
  );
}

export default Login;