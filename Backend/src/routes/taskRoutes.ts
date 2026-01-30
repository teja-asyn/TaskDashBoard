import express from 'express';
import { 
  getAllTasks,
  getTasksByProject, 
  createTask, 
  updateTask, 
  deleteTask,
  getTaskDetails,
  addSubtask,
  updateSubtask,
  deleteSubtask,
  updateTaskStatus
} from '../controllers/taskController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/', getAllTasks); // Get all tasks for the current user
router.get('/projects/:projectId/tasks', getTasksByProject);
router.get('/:taskId', getTaskDetails);

router.post('/', createTask);
router.post('/:taskId/subtasks', addSubtask);

router.put('/:taskId', updateTask);
router.put('/:taskId/status', updateTaskStatus);
router.put('/:taskId/subtasks/:subtaskId', updateSubtask);

router.delete('/:taskId', deleteTask);
router.delete('/:taskId/subtasks/:subtaskId', deleteSubtask);

export default router;