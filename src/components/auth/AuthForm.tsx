
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

interface AuthFormProps {
  type: "login" | "register";
  className?: string;
}

const AuthForm = ({ type, className }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (type === "login") {
        await login(email, password);
        navigate("/");
      } else {
        await register(email, password, name);
        navigate("/");
      }
    } catch (err) {
      console.error("Authentication error:", err);
      setError(
        type === "login"
          ? "Invalid email or password."
          : "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          {type === "login" ? "Welcome back" : "Create an account"}
        </h1>
        <p className="text-muted-foreground">
          {type === "login"
            ? "Enter your credentials to sign in to your account"
            : "Enter your information to create an account"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 rounded-md bg-destructive/10 text-destructive text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {type === "register" && (
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              disabled={isLoading}
              className="transition-all duration-200"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hello@example.com"
            required
            disabled={isLoading}
            className="transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {type === "login" && (
              <Button variant="link" className="h-auto p-0 text-sm">
                Forgot password?
              </Button>
            )}
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={isLoading}
            className="transition-all duration-200"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {type === "login" ? "Signing in..." : "Creating account..."}
            </div>
          ) : type === "login" ? (
            "Sign in"
          ) : (
            "Create account"
          )}
        </Button>

        <div className="mt-4 text-center text-sm">
          {type === "login" ? (
            <p>
              Don't have an account?{" "}
              <Button
                variant="link"
                className="h-auto p-0"
                onClick={() => navigate("/register")}
              >
                Register
              </Button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <Button
                variant="link"
                className="h-auto p-0"
                onClick={() => navigate("/login")}
              >
                Sign in
              </Button>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default AuthForm;
