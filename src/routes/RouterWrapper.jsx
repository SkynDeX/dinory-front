import React, { useState, useEffect, Suspense } from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import LoadingScreen from "../components/common/LoadingScreen";

export default function RouterWrapper() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  // 동화 읽기 페이지에서는 로딩 스크린 제외
  const isStoryReadingPage = location.pathname.startsWith('/story/') &&
                             location.pathname !== '/story/list' &&
                             location.pathname !== '/story/replay/';

  useEffect(() => {
    if (isStoryReadingPage) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [location.pathname, isStoryReadingPage]);

  if (loading && !isStoryReadingPage) return <LoadingScreen />;

  return (
    <Suspense fallback={<LoadingScreen />}>
      <AppRoutes />
    </Suspense>
  );
}
