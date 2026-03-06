import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./Components/Navbar.jsx";
import Home from "./Pages/HomePage.jsx";
import SignupPage from "./Pages/SignupPage.jsx";
import LoginPage from "./Pages/LoginPage.jsx";
import SettingsPage from "./Pages/Settings.jsx";
import ProfilePage from "./Pages/ProfilePage.jsx";
import { useAuthStore } from "./store/useAuthStore.js";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useThemeStore } from "./store/useThemeStore.js";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const  {theme}=useThemeStore();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

   // Log the authUser state variable to the console

  // If we're checking auth, or the user is not authenticated, show a loading spinner
  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  // After authentication check, render the routes
  return (
    <div data-theme={theme}>
      <Navbar />
      <Routes>
        {/* Protect the Home page, only accessible if authenticated */}
        <Route path="/" element={authUser ? <Home /> : <Navigate to="/login" />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/settings" element={authUser ? <SettingsPage /> : <Navigate to="/login" />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;
