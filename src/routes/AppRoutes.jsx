import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate, useParams, useLocation } from "react-router-dom";
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
import ParentDashboard from "../components/parent/ParentDashboard.jsx";
import ChildSelectPage from "../components/child/ChildSelectPage.jsx";
import EmotionCheckIn from "../components/child/EmotionCheckIn.jsx";
import InterestSelection from "../components/child/InterestSelection.jsx";
import StoryList from "../components/story/StoryList.jsx";
import StoryReading from "../components/story/StoryReading.jsx";
import StoryFlowTest from "../pages/StoryFlowTest.jsx";
import ChatInterface from "../components/chat/ChatInterface.jsx";
import StoryReplay from "../components/story/StoryReplay.jsx";
import LandingPage from "../pages/landing/LandingPage"; // ✅ [추가]

const MyDinos = lazy(() => import("../components/dino/MyDinos.jsx"));

// [2025-10-29 김광현] 채팅 페이지 컴포넌트
function ChatPage() {
  const {sessionId} = useParams();
  const location = useLocation();
  const {fromStroy, completionId} = location.state || {};

  return (
    <div className="chat-page">
      <ChatInterface
        initialSessionId={sessionId ? parseInt(sessionId) : null}
        childId={null}
      />
    </div>
  )
}

// 동화 완료 후 채팅 페이지 컴포넌트 (능력치 요약이 채팅 안에 포함됨)
function ChatPageFromStory() {
  const { completionId } = useParams();

  return (
    <div className="chat-page">
      <ChatInterface
        completionId={completionId ? parseInt(completionId) : null}
        childId={null}
      />
    </div>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/landing" element={<LandingPage />} /> {/* ✅ [추가] */}
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

        {/* 자녀 선택 */}
        <Route
          path="/child/select"
          element={
            <PrivateRoute>
              <ChildSelectPage />
            </PrivateRoute>
          }
        />

        {/* 자녀 감정 선택 */}
        <Route
          path="/child/emotion"
          element={
            <PrivateRoute>
              <EmotionCheckIn />
            </PrivateRoute>
          }
        />

        {/* 자녀 관심사 선택 */}
        <Route
          path="/child/interest"
          element={
            <PrivateRoute>
              <InterestSelection />
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

        {/* 부모 대시보드 */}
        <Route
          path="/parent/dashboard"
          element={
            <PrivateRoute>
              <ParentDashboard />
            </PrivateRoute>
          }
          />

          {/* 동화 목록 */}
          <Route 
            path="/story/list"
            element={
              <PrivateRoute>
                <StoryList />
              </PrivateRoute>
            }
          />
          {/* 동화 읽기 */}
          <Route
            path="/story/:storyId"
            element={
              <PrivateRoute>
                <StoryReading />
              </PrivateRoute>
            }
          />

           {/*[2025-11-03 김광현] 동화 다시보기 추가 */}
            <Route
              path="/story/replay/:completionId"
              element={
                <PrivateRoute>
                  <StoryReplay />
                </PrivateRoute>
              }
            />

          {/* 동화 완료 후 채팅 (더 구체적인 경로가 먼저) */}
          <Route
            path="/chat/story/:completionId"
            element={
              <PrivateRoute>
                <ChatPageFromStory />
              </PrivateRoute>
            }
          />

          {/* [2025-10-29 김광현] 일반 채팅 세션 */}
          <Route
            path="/chat/:sessionId"
            element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            }
          />

          {/* 테스트 페이지 */}
          <Route
            path="/test-story"
            element={<StoryFlowTest />}
          />

        {/* 기본 경로 */}
        <Route path="/" element={<Navigate to="/landing" replace />} /> 
        <Route path="*" element={<Navigate to="/landing" replace />} /> 
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
