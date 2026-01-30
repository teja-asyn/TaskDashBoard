import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../utils/testUtils';
import Login from '../../pages/Login';
import * as authSlice from '../../store/slices/authSlice';
import * as apiSlice from '../../store/api/apiSlice';

// Mock the auth slice
vi.mock('../../store/slices/authSlice', () => ({
  login: vi.fn(),
  clearError: vi.fn(),
}));

// Mock the API slice
vi.mock('../../store/api/apiSlice', () => ({
  apiSlice: {
    util: {
      resetApiState: vi.fn(),
    },
  },
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
  Toaster: () => null,
}));

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form with email and password fields', () => {
    render(<Login />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation error when submitting empty form', async () => {
    const user = userEvent.setup();
    render(<Login />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    // Should show error toast (mocked)
    expect(apiSlice.apiSlice.util.resetApiState).not.toHaveBeenCalled();
  });

  it('calls login action when form is submitted with valid data', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn().mockResolvedValue({
      type: 'auth/login/fulfilled',
      payload: { token: 'test-token', user: { _id: '1', email: 'test@test.com' } },
    });

    vi.mocked(authSlice.login).mockReturnValue(mockLogin() as any);

    render(<Login />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(apiSlice.apiSlice.util.resetApiState).toHaveBeenCalled();
    });
  });

  it('has link to register page', () => {
    render(<Login />);
    const registerLink = screen.getByRole('link', { name: /sign up/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(<Login />);

    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });

    expect(passwordInput.type).toBe('password');

    await user.click(toggleButton);
    expect(passwordInput.type).toBe('text');

    await user.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });
});

