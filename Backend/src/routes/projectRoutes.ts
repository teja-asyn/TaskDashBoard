import express from 'express';
import { getProjects, createProject, getProject, updateProject, deleteProject, getProjectTasks } from '../controllers/projectController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProject);
router.get('/:id/tasks', getProjectTasks); // GET /api/projects/:id/tasks - Required endpoint
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;