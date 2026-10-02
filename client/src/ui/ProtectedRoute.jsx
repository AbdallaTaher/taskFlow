import { Navigate } from "react-router-dom";
import { useUser } from "../features/auth/hooks/useUser";
import { Spinner } from "./Spinner";

export function ProtectedRoute({ children }) {
  const { user, isLoading, isAuthenticated } = useUser();

  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b14]">
        <Spinner className="w-8 h-8 text-violet-500" text="Authenticating session..." />
      </div>
    );
  }

  if (!isAuthenticated && !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
