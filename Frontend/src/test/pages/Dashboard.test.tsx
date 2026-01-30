import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../utils/testUtils';
import Dashboard from '../../pages/Dashboard';

// Mock the API hooks
vi.mock('../../store/api/projectApi', () => ({
  useGetProjectsQuery: vi.fn(() => ({
    data: [
      {
        _id: '1',
        name: 'Project 1',
        description: 'Description 1',
        totalTasks: 5,
        taskCounts: { todo: 2, 'in-progress': 2, done: 1 },
      },
      {
        _id: '2',
        name: 'Project 2',
        description: 'Description 2',
        totalTasks: 3,
        taskCounts: { todo: 1, 'in-progress': 1, done: 1 },
      },
    ],
    isLoading: false,
    error: null,
  })),
}));

vi.mock('../../store/slices/uiSlice', () => ({
  openModal: vi.fn(),
}));

vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useSelector: vi.fn((selector) => {
      const state = {
        auth: {
          user: { _id: '1', name: 'Test User', email: 'test@test.com' },
          token: 'test-token',
        },
        ui: {
          sidebarOpen: true,
          modal: { isOpen: false },
        },
      };
      return selector(state);
    }),
    useDispatch: () => vi.fn(),
  };
});

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard title', () => {
    render(<Dashboard />);
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });

  it('displays project cards', () => {
    render(<Dashboard />);
    expect(screen.getByText('Project 1')).toBeInTheDocument();
    expect(screen.getByText('Project 2')).toBeInTheDocument();
  });

  it('shows statistics cards', () => {
    render(<Dashboard />);
    // Should show total projects, total tasks, etc.
    expect(screen.getByText(/total projects/i)).toBeInTheDocument();
  });

  it('has button to create new project', () => {
    render(<Dashboard />);
    const createButton = screen.getByRole('button', { name: /new project/i });
    expect(createButton).toBeInTheDocument();
  });

  it('shows loading state when data is loading', () => {
    const { useGetProjectsQuery } = require('../../store/api/projectApi');
    useGetProjectsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<Dashboard />);
    // Should show loading skeletons
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows empty state when no projects exist', () => {
    const { useGetProjectsQuery } = require('../../store/api/projectApi');
    useGetProjectsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<Dashboard />);
    expect(screen.getByText(/no projects yet/i)).toBeInTheDocument();
  });
});

