import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { store } from '../../store/store';

// Custom render function that includes Redux Provider and Router
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Helper to create a mock store
export const createMockStore = (initialState: any = {}) => {
  return configureStore({
    reducer: {
      auth: (state: any = initialState.auth || { user: null, token: null }) => state,
      ui: (state: any = initialState.ui || { sidebarOpen: true, modal: { isOpen: false } }) => state,
    },
    preloadedState: initialState,
  });
};

