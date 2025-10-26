import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/EnhancedDashboard';
import Services from './pages/Services';
import ServicesWithMap from './pages/ServicesWithMap';
import ServiceDetail from './pages/ServiceDetail';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import CreateService from './pages/CreateService';
import EditService from './pages/EditService';
import MyServices from './pages/MyServices';
import BookService from './pages/BookService';
import BookingConfirmation from './pages/BookingConfirmation';
import Bookings from './pages/Bookings';
import CreateReview from './pages/CreateReview';
import AdminProviders from './pages/AdminProviders';
import AdminDisputes from './pages/AdminDisputes';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminServices from './pages/AdminServices';

const queryClient = new QueryClient();

// Layout wrapper to conditionally show Navbar
const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <>
      {!isAdminRoute && <Navbar />}
      {children}
    </>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <LayoutWrapper>
              <main className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin-register" element={<AdminRegister />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services-map" element={<ServicesWithMap />} />
                <Route path="/services/:id" element={<ServiceDetail />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
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
                  path="/chat" 
                  element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/chat/:userId" 
                  element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/create-service" 
                  element={
                    <ProtectedRoute>
                      <CreateService />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/edit-service/:id" 
                  element={
                    <ProtectedRoute>
                      <EditService />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/my-services" 
                  element={
                    <ProtectedRoute>
                      <MyServices />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/book/:serviceId" 
                  element={
                    <ProtectedRoute>
                      <BookService />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/booking-confirmation/:bookingId" 
                  element={
                    <ProtectedRoute>
                      <BookingConfirmation />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/bookings" 
                  element={
                    <ProtectedRoute>
                      <Bookings />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/review/:bookingId" 
                  element={
                    <ProtectedRoute>
                      <CreateReview />
                    </ProtectedRoute>
                  } 
                />
                <Route
                  path="/admin/providers"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminProviders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/disputes"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminDisputes />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/services"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminServices />
                    </ProtectedRoute>
                  }
                />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
              </main>
            </LayoutWrapper>
            <Toaster position="top-right" />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;