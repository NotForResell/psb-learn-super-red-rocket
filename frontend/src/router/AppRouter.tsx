import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import StudentDashboardPage from "../pages/StudentDashboardPage";
import CoursePage from "../pages/CoursePage";
import LessonPage from "../pages/LessonPage";
import AssignmentPage from "../pages/AssignmentPage";
import SubmissionPage from "../pages/SubmissionPage";
import ProgressPage from "../pages/ProgressPage";
import GradesPage from "../pages/GradesPage";
import CalendarPage from "../pages/CalendarPage";
import TestPage from "../pages/TestPage";
import ProfilePage from "../pages/ProfilePage";
import AppLayout from "../components/layout/AppLayout";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { token } = useAuthStore();
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

const AppRouter = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route
      path="/"
      element={
        <PrivateRoute>
          <AppLayout>
            <StudentDashboardPage />
          </AppLayout>
        </PrivateRoute>
      }
    />
    <Route
      path="/dashboard"
      element={
        <PrivateRoute>
          <AppLayout>
            <StudentDashboardPage />
          </AppLayout>
        </PrivateRoute>
      }
    />
    <Route
      path="/courses/:courseId"
      element={
        <PrivateRoute>
          <AppLayout>
            <CoursePage />
          </AppLayout>
        </PrivateRoute>
      }
    />
    <Route
      path="/courses/:courseId/lessons/:lessonId"
      element={
        <PrivateRoute>
          <AppLayout>
            <LessonPage />
          </AppLayout>
        </PrivateRoute>
      }
    />
    <Route
      path="/assignments/:assignmentId"
      element={
        <PrivateRoute>
          <AppLayout>
            <AssignmentPage />
          </AppLayout>
        </PrivateRoute>
      }
    />
    <Route
      path="/submissions/:submissionId"
      element={
        <PrivateRoute>
          <AppLayout>
            <SubmissionPage />
          </AppLayout>
        </PrivateRoute>
      }
    />
    <Route
      path="/progress"
      element={
        <PrivateRoute>
          <AppLayout>
            <ProgressPage />
          </AppLayout>
        </PrivateRoute>
      }
    />
    <Route
      path="/grades"
      element={
        <PrivateRoute>
          <AppLayout>
            <GradesPage />
          </AppLayout>
        </PrivateRoute>
      }
    />
    <Route
      path="/calendar"
      element={
        <PrivateRoute>
          <AppLayout>
            <CalendarPage />
          </AppLayout>
        </PrivateRoute>
      }
    />
    <Route
      path="/tests/:testId"
      element={
        <PrivateRoute>
          <AppLayout>
            <TestPage />
          </AppLayout>
        </PrivateRoute>
      }
    />
    <Route
      path="/profile"
      element={
        <PrivateRoute>
          <AppLayout>
            <ProfilePage />
          </AppLayout>
        </PrivateRoute>
      }
    />
  </Routes>
);

export default AppRouter;
