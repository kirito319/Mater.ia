import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import LoadingScreen from '@/components/LoadingScreen';

// Shows a white branded loading overlay briefly on route changes
const RouteChangeLoader: React.FC = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const prevPath = useRef<string>(`${location.pathname}${location.search}${location.hash}`);

  useEffect(() => {
    const nextPath = `${location.pathname}${location.search}${location.hash}`;
    if (prevPath.current !== nextPath) {
      prevPath.current = nextPath;
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 450); // brief, smooth transition
      return () => clearTimeout(timer);
    }
  }, [location]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-white">
      <LoadingScreen />
    </div>
  );
};

export default RouteChangeLoader;

