import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "../components/auth/PrivateRoute";
import Login from "../components/auth/Login";
import OAuth2Callback from "../components/auth/OAuth2Callback";
import Intro from "../pages/intro/Intro";
import HomePage from "../pages/home/HomePage";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import ImageTest from "../pages/ImageTest";
import LoadingScreen from "../components/common/LoadingScreen"; 
import ChildRegistration from "../components/child/ChildRegistration.jsx";

const MyDinos = lazy(() => import("../components/dino/MyDinos.jsx"));

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/intro" element={<Intro />} />
        <Route path="/main" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/oauth2/redirect" element={<OAuth2Callback />} />

        {/* Private Routes */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/image-test"
          element={
            <PrivateRoute>
              <ImageTest />
            </PrivateRoute>
          }
        />

        {/* 내 공룡보기 로딩 */}
        <Route
          path="/my-dinos"
          element={
            <PrivateRoute>
              <MyDinos />
            </PrivateRoute>
          }
        />

        {/* 자녀 등록 */}
        <Route
          path="/child/registration"
          element={
            <PrivateRoute>
              <ChildRegistration />
            </PrivateRoute>
          }
          />

        {/* 기본 경로 */}
        <Route path="/" element={<Navigate to="/intro" replace />} />
        <Route path="*" element={<Navigate to="/intro" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
