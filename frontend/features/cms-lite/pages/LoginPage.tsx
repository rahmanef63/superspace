"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../shared/components/Button";
import { Input } from "../shared/components/Form";
import { toast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Replace with actual auth implementation
      console.warn('Login functionality needs to be implemented with auth provider');
      
      // Mock login for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      // Mock token storage
      localStorage.setItem("auth_token", "mock_token_" + Date.now());
      localStorage.setItem("user_email", email);
      localStorage.setItem("user_role", "admin");
      
      toast({
        title: "Success",
        description: "Logged in successfully",
      });

      router.push("/admin");
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: error.message || "Login failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 bg-card rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-foreground">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Email</label>
            <Input
              type="email"
              value={email}
              onChange={setEmail}
              required
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Password</label>
            <Input
              type="password"
              value={password}
              onChange={setPassword}
              required
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}
