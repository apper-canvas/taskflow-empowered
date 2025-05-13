import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import getIcon from '../utils/iconUtils';
import { fetchTasks, createTask, updateTask, deleteTask } from '../services/taskService';
import { useSelector } from 'react-redux';

function MainFeature() {
  // Declare icon components
  const PlusIcon = getIcon('Plus');
  const TrashIcon = getIcon('Trash2');
  const EditIcon = getIcon('Edit');
  const CheckIcon = getIcon('Check');
  const AlertIcon = getIcon('AlertCircle');
  const ArrowUpIcon = getIcon('ArrowUp');
  const ArrowDownIcon = getIcon('ArrowDown');
  const CalendarIcon = getIcon('Calendar');
  const TagIcon = getIcon('Tag');
  const ClockIcon = getIcon('Clock');
  const XIcon = getIcon('X');
  
  const [tasks, setTasks] = useState([]);
  
  // State for new task form
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: new Date().toISOString().slice(0, 10)
  });
  
  // State for task being edited
  const [editingTask, setEditingTask] = useState(null);
  
  // State for task filter
  const [filter, setFilter] = useState('all');
  
  // State for sorting
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Loading state
  const [loading, setLoading] = useState(false);
  
  // Ref for task input
  const taskInputRef = useRef(null);
  
  // Get user info from Redux
  const { user } = useSelector(state => state.user);
  
  // Load tasks from backend
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const tasksData = await fetchTasks({
          sortBy: sortBy,
          sortDirection: sortDirection
        });
        setTasks(tasksData);
      } catch (error) {
        console.error("Error loading tasks:", error);
        toast.error("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };
    
    loadTasks();
  }, [sortBy, sortDirection]);
  
  // Filter tasks based on current filter
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'completed') return task.status === 'completed';
    if (filter === 'active') return task.status !== 'completed';
    return true;
  });
  
  // Handle input changes for new task
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle edit input changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingTask(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Add a new task
  const addTask = (e) => {
    e.preventDefault();

    if (!newTask.title.trim()) {
      toast.error("Task title cannot be empty!");
      return;
    }

    setLoading(true);
    createTask({
      ...newTask,
      status: 'todo'
    })
      .then(newTask => {
        setTasks(prev => [newTask, ...prev]);
        setNewTask({
          title: '',
          description: '',
          priority: 'medium',
          dueDate: new Date().toISOString().slice(0, 10)
        });
        
        toast.success("Task added successfully!");
        
        // Focus back on the input
        if (taskInputRef.current) {
          taskInputRef.current.focus();
        }
      })
      .catch(error => {
        console.error("Error adding task:", error);
        toast.error("Failed to add task");
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  // Delete a task
  const deleteTask = (id) => {
    setLoading(true);
    deleteTask(id)
      .then(() => {
        setTasks(prev => prev.filter(task => task.id !== id));
        toast.success("Task deleted successfully!");
      })
      .catch(error => {
        console.error("Error deleting task:", error);
        toast.error("Failed to delete task");
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  // Start editing a task
  const startEdit = (task) => {
    setEditingTask({ ...task });
  };
  
  // Cancel editing
  const cancelEdit = () => {
    setEditingTask(null);
  };
  
  // Save edited task
  const saveEdit = () => {
    if (!editingTask.title.trim()) {
      toast.error("Task title cannot be empty!");
      return;
    }

    setLoading(true);
    updateTask({
      ...editingTask,
      updatedAt: new Date().toISOString()
    })
      .then(updatedTask => {
        setTasks(prev => 
          prev.map(task => 
            task.id === updatedTask.id ? updatedTask : task
          )
        );
        
        setEditingTask(null);
        toast.success("Task updated successfully!");
      })
      .catch(error => {
        console.error("Error updating task:", error);
        toast.error("Failed to update task");
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  // Toggle task status
  const toggleTaskStatus = (id) => {
    const taskToUpdate = tasks.find(task => task.id === id);
    if (!taskToUpdate) return;

    const newStatus = taskToUpdate.status === 'completed' ? 'todo' : 'completed';
    const updatedTask = {
      ...taskToUpdate,
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date().toISOString() : null
    };

    setLoading(true);
    updateTask(updatedTask)
      .then(updatedTask => {
        setTasks(prev => 
          prev.map(task => task.id === id ? updatedTask : task)
        );
        
        toast.info("Task status updated!");
      })
      .catch(error => {
        console.error("Error updating task status:", error);
        toast.error("Failed to update task status");
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  // Get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };
  
  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // For priority, we need to convert string priority to numeric value
    if (sortBy === 'priority') {
      const priorityValues = { high: 3, medium: 2, low: 1 };
      if (sortDirection === 'asc') {
        return priorityValues[a.priority] - priorityValues[b.priority];
      } else {
        return priorityValues[b.priority] - priorityValues[a.priority];
      }
    }
    
    // For dates
    if (sortBy === 'dueDate' || sortBy === 'createdAt') {
      const aDate = new Date(a[sortBy]);
      const bDate = new Date(b[sortBy]);
      
      if (sortDirection === 'asc') {
        return aDate - bDate;
      } else {
        return bDate - aDate;
      }
    }
    
    // For title
    if (sortBy === 'title') {
      if (sortDirection === 'asc') {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    }
    
    return 0;
  });
  
  // Toggle sort direction or change sort field
  const handleSort = (field) => {
    if (sortBy === field) {
      // If already sorting by this field, toggle direction
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // If changing field, default to ascending
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <h2 className="text-2xl font-bold">My Tasks</h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Filter Buttons */}
          <div className="flex rounded-lg overflow-hidden shadow-sm border border-surface-200 dark:border-surface-700">
            <button 
              className={`px-4 py-2 text-sm font-medium ${filter === 'all' 
                ? 'bg-primary text-white' 
                : 'bg-white dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700'}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium ${filter === 'active' 
                ? 'bg-primary text-white' 
                : 'bg-white dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700'}`}
              onClick={() => setFilter('active')}
            >
              Active
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium ${filter === 'completed' 
                ? 'bg-primary text-white' 
                : 'bg-white dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700'}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
          </div>
          
          {/* Sort Dropdown */}
          <div className="relative">
            <select 
              className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm font-medium cursor-pointer"
              value={`${sortBy}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-');
                setSortBy(field);
                setSortDirection(direction);
              }}
            >
              <option value="dueDate-asc">Due Date (Earliest)</option>
              <option value="dueDate-desc">Due Date (Latest)</option>
              <option value="priority-desc">Priority (Highest)</option>
              <option value="priority-asc">Priority (Lowest)</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
              <option value="createdAt-desc">Recently Added</option>
              <option value="createdAt-asc">Oldest Added</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              {sortDirection === 'asc' 
                ? <ArrowUpIcon className="h-4 w-4 text-surface-500" />
                : <ArrowDownIcon className="h-4 w-4 text-surface-500" />
              }
            </div>
          </div>
        </div>
      </div>
      
      {/* Add New Task Form */}
      <form onSubmit={addTask} className="card p-5 space-y-4">
        <h3 className="text-lg font-semibold">Add New Task</h3>
        
        <div>
          <label htmlFor="title" className="label">Task Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={newTask.title}
            onChange={handleInputChange}
            placeholder="What needs to be done?"
            className="input"
            ref={taskInputRef}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="description" className="label">Description (Optional)</label>
            <textarea
              id="description"
              name="description"
              value={newTask.description}
              onChange={handleInputChange}
              placeholder="Add details about this task..."
              className="input min-h-[80px]"
              rows="3"
            />
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="priority" className="label">Priority</label>
              <div className="flex gap-2">
                {['low', 'medium', 'high'].map(priority => (
                  <button
                    key={priority}
                    type="button"
                    className={`flex-1 py-2 rounded-lg capitalize text-sm font-medium transition-all ${
                      newTask.priority === priority
                        ? getPriorityColor(priority) + ' ring-1 ring-opacity-50 ring-' + (priority === 'high' ? 'red' : priority === 'medium' ? 'amber' : 'green') + '-500'
                        : 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700'
                    }`}
                    onClick={() => setNewTask(prev => ({ ...prev, priority }))}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label htmlFor="dueDate" className="label flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" /> Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={newTask.dueDate}
                onChange={handleInputChange}
                className="input"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn-primary"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Add Task
          </button>
        </div>
      </form>
      
      {/* Task List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {filter === 'all' ? 'All Tasks' : filter === 'completed' ? 'Completed Tasks' : 'Active Tasks'}
          <span className="ml-2 text-sm font-normal text-surface-500 dark:text-surface-400">{sortedTasks.length} tasks</span>
        </h3>
        
        {loading ? (
          <div className="card p-12 flex flex-col items-center justify-center text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
            <p className="text-lg font-medium text-surface-600 dark:text-surface-400">
              Loading tasks...
            </p>
            <p className="text-sm text-surface-500 dark:text-surface-500 mt-1">
              Please wait while we fetch your tasks.
            </p>
          </div>
        ) : sortedTasks.length === 0 ? (
          <div className="card p-12 flex flex-col items-center justify-center text-center">
            <AlertIcon className="h-10 w-10 text-surface-400 dark:text-surface-600 mb-4" />
            <p className="text-lg font-medium text-surface-600 dark:text-surface-400">No tasks found</p>
            <p className="text-sm text-surface-500 dark:text-surface-500 mt-1">
              {filter === 'all' 
                ? "Start by adding a new task above."
                : filter === 'completed'
                ? "You don't have any completed tasks yet."
                : "You don't have any active tasks."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {sortedTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`card ${task.status === 'completed' ? 'border-l-4 border-l-green-500' : ''}`}
                >
                  {editingTask && editingTask.id === task.id ? (
                    // Edit Mode
                    <div className="p-5 space-y-4">
                      <h4 className="text-lg font-semibold">Edit Task</h4>
                      
                      <div>
                        <label className="label">Task Title</label>
                        <input
                          type="text"
                          name="title"
                          value={editingTask.title}
                          onChange={handleEditChange}
                          className="input"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="label">Description</label>
                        <textarea
                          name="description"
                          value={editingTask.description}
                          onChange={handleEditChange}
                          className="input min-h-[80px]"
                          rows="3"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="label">Priority</label>
                          <div className="flex gap-2">
                            {['low', 'medium', 'high'].map(priority => (
                              <button
                                key={priority}
                                type="button"
                                className={`flex-1 py-2 rounded-lg capitalize text-sm font-medium transition-all ${
                                  editingTask.priority === priority
                                    ? getPriorityColor(priority) + ' ring-1 ring-opacity-50 ring-' + (priority === 'high' ? 'red' : priority === 'medium' ? 'amber' : 'green') + '-500'
                                    : 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700'
                                }`}
                                onClick={() => setEditingTask(prev => ({ ...prev, priority }))}
                              >
                                {priority}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <label className="label flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" /> Due Date
                          </label>
                          <input
                            type="date"
                            name="dueDate"
                            value={editingTask.dueDate}
                            onChange={handleEditChange}
                            className="input"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="btn-outline"
                        >
                          <XIcon className="h-4 w-4 mr-1" />
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={saveEdit}
                          className="btn-primary"
                        >
                          <CheckIcon className="h-4 w-4 mr-1" />
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <button
                            onClick={() => toggleTaskStatus(task.id)}
                            className={`mt-0.5 h-5 w-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                              task.status === 'completed'
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-surface-300 dark:border-surface-600 hover:border-green-500 dark:hover:border-green-500'
                            }`}
                            aria-label={task.status === 'completed' ? "Mark as incomplete" : "Mark as complete"}
                          >
                            {task.status === 'completed' && <CheckIcon className="h-3 w-3" />}
                          </button>
                          
                          <div className="space-y-1">
                            <h4 className={`text-lg font-medium ${task.status === 'completed' ? 'line-through text-surface-500 dark:text-surface-400' : ''}`}>
                              {task.title}
                            </h4>
                            
                            {task.description && (
                              <p className="text-sm text-surface-600 dark:text-surface-300">
                                {task.description}
                              </p>
                            )}
                            
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className={`px-2 py-1 rounded-md text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                <TagIcon className="h-3 w-3 inline mr-1" />
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </span>
                              
                              <span className="px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                <CalendarIcon className="h-3 w-3 inline mr-1" />
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                              
                              {task.status === 'completed' && task.completedAt && (
                                <span className="px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                  <CheckIcon className="h-3 w-3 inline mr-1" />
                                  Completed: {new Date(task.completedAt).toLocaleDateString()}
                                </span>
                              )}
                              
                              <span className="px-2 py-1 rounded-md text-xs font-medium bg-surface-100 text-surface-700 dark:bg-surface-700 dark:text-surface-300">
                                <ClockIcon className="h-3 w-3 inline mr-1" />
                                Created: {new Date(task.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => startEdit(task)}
                            className="p-2 text-surface-500 hover:text-primary dark:text-surface-400 dark:hover:text-primary-light rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                            aria-label="Edit task"
                          >
                            <EditIcon className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-2 text-surface-500 hover:text-red-500 dark:text-surface-400 dark:hover:text-red-400 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                            aria-label="Delete task"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default MainFeature;