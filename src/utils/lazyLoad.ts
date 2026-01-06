import React from 'react';

/**
 * Higher-order component for lazy loading screens
 * Reduces initial bundle size by code-splitting screens
 * @param importFunc - Dynamic import function for the component
 * @returns Lazy-loaded component with Suspense fallback
 * @example
 * const LoginScreen = lazyLoad(() => import('../screens/LoginScreen'));
 */
export const lazyLoad = (importFunc: () => Promise<{ default: React.ComponentType<any> }>) => {
  const LazyComponent = React.lazy(importFunc);

  return (props: any) => (
    <React.Suspense fallback={<LoadingFallback />}>
      <LazyComponent {...props} />
    </React.Suspense>
  );
};

/**
 * Loading fallback component displayed while lazy component loads
 */
const LoadingFallback = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#F9FAFB',
    }}>
      <div style={{
        fontSize: '16px',
        color: '#6B7280',
      }}>
        Loading...
      </div>
    </div>
  );
};

/**
 * Preload a lazy component to improve perceived performance
 * @param importFunc - Dynamic import function for the component
 * @example
 * preloadComponent(() => import('../screens/HomeScreen'));
 */
export const preloadComponent = (importFunc: () => Promise<any>) => {
  importFunc();
};

/**
 * Batch preload multiple components
 * @param importFuncs - Array of dynamic import functions
 * @example
 * batchPreloadComponents([
 *   () => import('../screens/HomeScreen'),
 *   () => import('../screens/ProfileScreen'),
 * ]);
 */
export const batchPreloadComponents = (importFuncs: Array<() => Promise<any>>) => {
  importFuncs.forEach(importFunc => {
    preloadComponent(importFunc);
  });
};
