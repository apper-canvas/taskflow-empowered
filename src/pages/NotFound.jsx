import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import getIcon from '../utils/iconUtils';

function NotFound({ darkMode, toggleDarkMode }) {
  // Declare icon components
  const SunIcon = getIcon('Sun');
  const MoonIcon = getIcon('Moon');
  const HomeIcon = getIcon('Home');
  const AlertCircleIcon = getIcon('AlertCircle');
  
  // Animation variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col"
      initial="initial"
      animate="animate"
      variants={containerVariants}
    >
      {/* Header */}
      <header className="bg-white dark:bg-surface-800 shadow-sm border-b border-surface-200 dark:border-surface-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <HomeIcon className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-primary dark:text-primary-light">TaskFlow</h1>
            </Link>
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
      
      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <motion.div 
          className="text-center"
          variants={containerVariants}
        >
          <motion.div 
            className="inline-block p-6 bg-red-100 dark:bg-red-900/30 rounded-full mb-6"
            variants={itemVariants}
          >
            <AlertCircleIcon className="h-16 w-16 text-red-500" />
          </motion.div>
          
          <motion.h1 
            className="text-5xl font-bold mb-4 text-surface-900 dark:text-surface-100"
            variants={itemVariants}
          >
            404
          </motion.h1>
          
          <motion.p 
            className="text-xl mb-8 text-surface-600 dark:text-surface-300"
            variants={itemVariants}
          >
            Oops! The page you're looking for cannot be found.
          </motion.p>
          
          <motion.div variants={itemVariants}>
            <Link
              to="/"
              className="btn-primary px-6 py-3 text-lg"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Return Home
            </Link>
          </motion.div>
        </motion.div>
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

export default NotFound;