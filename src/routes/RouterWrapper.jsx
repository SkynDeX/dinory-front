import React, { useState, useEffect, Suspense } from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import LoadingScreen from "../components/common/LoadingScreen";

export default function RouterWrapper() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000); 
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (loading) return <LoadingScreen />;

  return (
    <Suspense fallback={<LoadingScreen />}>
      <AppRoutes />
    </Suspense>
  );
}
