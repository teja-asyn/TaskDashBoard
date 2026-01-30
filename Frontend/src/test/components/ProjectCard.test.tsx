import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../utils/testUtils';
import ProjectCard from '../../components/dashboard/ProjectCard';
import type { Project } from '../../types';

// Mock the hooks
vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useDispatch: () => vi.fn(),
  };
});

vi.mock('../../store/api/projectApi', () => ({
  useDeleteProjectMutation: () => [
    vi.fn(),
    { isLoading: false },
  ],
}));

vi.mock('../../store/slices/uiSlice', () => ({
  openModal: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockProject: Project = {
  _id: '1',
  name: 'Test Project',
  description: 'Test description',
  ownerId: 'user1',
  createdAt: new Date().toISOString(),
  totalTasks: 10,
  taskCounts: {
    todo: 5,
    'in-progress': 3,
    done: 2,
  },
};

describe('ProjectCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders project name and description', () => {
    render(<ProjectCard project={mockProject} />);

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('displays task counts correctly', () => {
    render(<ProjectCard project={mockProject} />);

    expect(screen.getByText(/10/i)).toBeInTheDocument(); // Total tasks
  });

  it('shows completion percentage', () => {
    render(<ProjectCard project={mockProject} />);

    // Should show progress bar
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });

  it('has link to project view', () => {
    render(<ProjectCard project={mockProject} />);

    const viewLink = screen.getByText(/view project/i);
    expect(viewLink).toBeInTheDocument();
    expect(viewLink.closest('a')).toHaveAttribute('href', '/projects/1');
  });

  it('opens options menu when menu button is clicked', async () => {
    const user = userEvent.setup();
    render(<ProjectCard project={mockProject} />);

    const menuButton = screen.getByLabelText(/options menu for test project/i);
    await user.click(menuButton);

    // Menu should be visible
    await waitFor(() => {
      expect(screen.getByText(/view project/i)).toBeInTheDocument();
      expect(screen.getByText(/edit project/i)).toBeInTheDocument();
      expect(screen.getByText(/delete project/i)).toBeInTheDocument();
    });
  });
});

