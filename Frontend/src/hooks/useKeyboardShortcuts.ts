import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { closeModal } from '../store/slices/uiSlice';

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K - Focus search (if on project view)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }

      // Escape - Close modals
      if (e.key === 'Escape') {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
          dispatch(closeModal());
        }
      }

      // Ctrl+/ or Cmd+/ - Show keyboard shortcuts help
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        // Could show a help modal here
        console.log('Keyboard shortcuts:\nCtrl+K - Focus search\nEsc - Close modal');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, dispatch]);
};

