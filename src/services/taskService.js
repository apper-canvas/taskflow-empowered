// Task service for handling all task-related operations with Apper backend

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

// Table name from the provided JSON structure
const TABLE_NAME = 'task1';

/**
 * Fetch all tasks with optional filtering
 * @param {Object} filters - Optional filter parameters
 * @returns {Promise<Array>} - Array of task objects
 */
export const fetchTasks = async (filters = {}) => {
  try {
    const apperClient = getApperClient();
    
    // Prepare the request parameters
    const params = {
      Fields: [
        { Field: { Name: "Id" } },
        { Field: { Name: "title" } },
        { Field: { Name: "description" } },
        { Field: { Name: "priority" } },
        { Field: { Name: "status" } },
        { Field: { Name: "dueDate" } },
        { Field: { Name: "completedAt" } },
        { Field: { Name: "CreatedOn" } },
        { Field: { Name: "Owner" } }
      ],
      where: []
    };
    
    // Add status filter if provided
    if (filters.status) {
      params.where.push({
        fieldName: "status",
        Operator: "ExactMatch",
        values: [filters.status]
      });
    }
    
    // Add date filtering if needed
    if (filters.dueDateFrom) {
      params.where.push({
        fieldName: "dueDate",
        Operator: "GreaterThanOrEqual",
        values: [filters.dueDateFrom]
      });
    }
    
    if (filters.dueDateTo) {
      params.where.push({
        fieldName: "dueDate",
        Operator: "LessThanOrEqual",
        values: [filters.dueDateTo]
      });
    }
    
    // Add sorting
    if (filters.sortBy) {
      params.orderBy = [
        {
          field: filters.sortBy,
          direction: filters.sortDirection || "asc"
        }
      ];
    }
    
    const response = await apperClient.fetchRecords(TABLE_NAME, params);
    
    if (response && response.data) {
      // Transform data to match the app's expected format
      return response.data.map(task => ({
        id: task.Id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
        completedAt: task.completedAt,
        createdAt: task.CreatedOn,
        owner: task.Owner
      }));
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

/**
 * Create a new task
 * @param {Object} taskData - Task data to create
 * @returns {Promise<Object>} - Created task object
 */
export const createTask = async (taskData) => {
  try {
    const apperClient = getApperClient();
    
    const response = await apperClient.createRecord(TABLE_NAME, {
      records: [
        {
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          status: taskData.status || 'todo',
          dueDate: taskData.dueDate
        }
      ]
    });
    
    if (response && response.success && response.results && response.results.length > 0) {
      const createdTask = response.results[0].data;
      return {
        id: createdTask.Id,
        title: createdTask.title,
        description: createdTask.description,
        priority: createdTask.priority,
        status: createdTask.status,
        dueDate: createdTask.dueDate,
        createdAt: createdTask.CreatedOn
      };
    }
    
    throw new Error("Failed to create task");
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

/**
 * Update an existing task
 * @param {Object} taskData - Task data with ID to update
 * @returns {Promise<Object>} - Updated task object
 */
export const updateTask = async (taskData) => {
  try {
    const apperClient = getApperClient();
    
    const response = await apperClient.updateRecord(TABLE_NAME, {
      records: [
        {
          Id: taskData.id,
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          status: taskData.status,
          dueDate: taskData.dueDate,
          completedAt: taskData.status === 'completed' ? new Date().toISOString() : null
        }
      ]
    });
    
    if (response && response.success && response.results && response.results.length > 0) {
      const updatedTask = response.results[0].data;
      return {
        id: updatedTask.Id,
        title: updatedTask.title,
        description: updatedTask.description,
        priority: updatedTask.priority,
        status: updatedTask.status,
        dueDate: updatedTask.dueDate,
        completedAt: updatedTask.completedAt,
        createdAt: updatedTask.CreatedOn
      };
    }
    
    throw new Error("Failed to update task");
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

/**
 * Delete a task by ID
 * @param {String|Number} taskId - ID of the task to delete
 * @returns {Promise<Boolean>} - Success status
 */
export const deleteTask = async (taskId) => {
  try {
    const apperClient = getApperClient();
    
    const response = await apperClient.deleteRecord(TABLE_NAME, {
      RecordIds: [taskId]
    });
    
    return !!(response && response.success);
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

/**
 * Fetch dashboard statistics
 * @returns {Promise<Object>} - Task statistics
 */
export const fetchTaskStats = async () => {
  try {
    const tasks = await fetchTasks();
    
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    
    const stats = {
      completed: 0,
      pending: 0,
      upcoming: 0
    };
    
    tasks.forEach(task => {
      if (task.status === 'completed') {
        stats.completed++;
      } else {
        stats.pending++;
        
        // Check if the task is upcoming (due date is in the future)
        const dueDate = new Date(task.dueDate);
        if (dueDate >= today) {
          stats.upcoming++;
        }
      }
    });
    
    return stats;
  } catch (error) {
    console.error("Error fetching task stats:", error);
    return {
      completed: 0,
      pending: 0,
      upcoming: 0
    };
  }
};