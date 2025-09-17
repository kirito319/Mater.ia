import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CreateCourse from "./pages/admin/CreateCourse";
import CourseContent from "./pages/admin/CourseContent";
import Profile from "./pages/Profile";
import CourseDetail from "./pages/CourseDetail";
import CourseLearn from "./pages/CourseLearn";
import Courses from "./pages/Courses";
import Certificates from "./pages/Certificates";
import Education from "./pages/Education";
import AI from "./pages/AI";
import Subscription from "./pages/Subscription";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={ <Auth />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route 
              path="/course/:id/learn" 
              element={
                <ProtectedRoute>
                  <CourseLearn />
                </ProtectedRoute>
              } 
            />
            <Route path="/courses" element={<Courses />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/education" 
              element={
                <ProtectedRoute>
                  <Education />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ai" 
              element={
                <ProtectedRoute>
                  <AI />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/subscription" 
              element={
                <ProtectedRoute>
                  <Subscription />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/courses/new" 
              element={
                <ProtectedRoute>
                  <CreateCourse />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/courses/:courseId/edit" 
              element={
                <ProtectedRoute>
                  <CreateCourse />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/courses/:courseId/content" 
              element={
                <ProtectedRoute>
                  <CourseContent />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
