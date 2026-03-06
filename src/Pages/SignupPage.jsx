import { useState } from "react"; // Importing the useState hook to manage local state
import { useAuthStore } from "../store/useAuthStore"; // Importing custom hook to access authentication-related actions
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from "lucide-react"; // Importing icons for UI
import { Link } from "react-router-dom"; // Importing Link component for navigation
import { useNavigate } from "react-router-dom";
import AuthImagePattern from "../Components/AuthImagePattern.jsx" // Importing a custom component for the image and text pattern on the right side
import toast from "react-hot-toast"; // Importing a library for showing toast notifications

const SignUpPage = () => {
  // State to toggle showing/hiding the password
  const [showPassword, setShowPassword] = useState(false);

  // State to manage form input values
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate(); // Initialize useNavigate
  // Extracting the signup function and loading state from the auth store
  const { signup, isSigningUp } = useAuthStore();

  // Function to validate the form inputs
  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required"); // Check if full name is empty
    if (!formData.email.trim()) return toast.error("Email is required"); // Check if email is empty
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format"); // Check if email is in the correct format
    if (!formData.password) return toast.error("Password is required"); // Check if password is empty
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters or more"); // Check if password is too short

    return true; // Return true if all validations pass
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const success = validateForm();

    if (success === true) {
      try {
        await signup(formData); // Attempt to create the account
        toast.success("Account created successfully!");
        navigate("/"); // Redirect to the home page
      } catch (error) {
        toast.error(error.message || "Failed to create account");
      }
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 mt-5">
      {/* Left side: Form and content */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header with logo and title */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="size-12 rounded-xl bg-primary/10 flex items-center justify-center 
              group-hover:bg-primary/20 transition-colors"
              >
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Create Account</h1>
              <p className="text-base-content/60">Get started with your free account</p>
            </div>
          </div>

          {/* Sign-up form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User name */}
            <div className="form-control">
              
              <label className="label">
                <span className="label-text font-medium">Username</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-5 text-base-content/40" /> {/* User icon */}
                </div>
                <input
                  type="text"
                  className={`input input-bordered w-full pl-10`}
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })} // Update user name in state
                />
              </div>
            </div>
            {/* Full Name input */}
            <div className="form-control">
              
              <label className="label">
                <span className="label-text font-medium">Full Name</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-5 text-base-content/40" /> {/* User icon */}
                </div>
                <input
                  type="text"
                  className={`input input-bordered w-full pl-10`}
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} // Update full name in state
                />
              </div>
            </div>

            {/* Email input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-base-content/40" /> {/* Mail icon */}
                </div>
                <input
                  type="email"
                  className={`input input-bordered w-full pl-10`}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} // Update email in state
                />
              </div>
            </div>

            {/* Password input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40" /> {/* Lock icon */}
                </div>
                <input
                  type={showPassword ? "text" : "password"} // Toggle password visibility
                  className={`input input-bordered w-full pl-10`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })} // Update password in state
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/40" /> // Hide password icon
                  ) : (
                    <Eye className="size-5 text-base-content/40" /> // Show password icon
                  )}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button type="submit" className="btn btn-primary w-full" disabled={isSigningUp}>
              {isSigningUp ? (
                <>
                  <Loader2 className="size-5 animate-spin" /> {/* Loading spinner */}
                  Loading...
                </>
              ) : (
                "Create Account" // Button text
              )}
            </button>
          </form>

          {/* Link to sign in */}
          <div className="text-center">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Image and text */}
      <AuthImagePattern
        title="Join our community"
        subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
      />
    </div>
  );
};
export default SignUpPage;
