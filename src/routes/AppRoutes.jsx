import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "../components/auth/PrivateRoute";
import Login from "../components/auth/Login";
import OAuth2Callback from "../components/auth/OAuth2Callback";
import Intro from "../pages/intro/Intro";
import HomePage from "../pages/home/HomePage";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import ImageTest from "../pages/ImageTest";
import MyDinos from "../components/MyDinos.jsx";

function AppRoutes() {
  return (
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
      <Route
        path="/my-dinos"
        element={
          <PrivateRoute>
            <MyDinos />
          </PrivateRoute>
        }
      />

      {/* 기본 경로를 인트로로 변경 */}
      <Route path="/" element={<Navigate to="/intro" replace />} />

      {/* 예외 처리 */}
      <Route path="*" element={<Navigate to="/intro" replace />} />
    </Routes>
  );
}

export default AppRoutes;
