import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Users, BookOpen, Calendar, MessageSquare, Shield, Eye, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Auth() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    username: "",
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    window.location.href = "/";
    return null;
  }

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: () => {
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      username: string;
    }) => {
      const res = await apiRequest("POST", "/api/register", userData);
      return await res.json();
    },
    onSuccess: () => {
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    loginMutation.mutate({ email, password });
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const username = formData.get("username") as string;

    if (password !== confirmPassword) {
      toast({
        title: "Registration failed",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate({ email, password, firstName, lastName, username });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-10 h-10 bg-lautech-blue rounded-lg flex items-center justify-center">
                  <GraduationCap className="text-white text-lg" />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-gray-900">LAUTECH Portal</h1>
                  <p className="text-xs text-gray-600">Academic Management System</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Auth Forms */}
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <CardTitle>Welcome to LAUTECH Portal</CardTitle>
                <CardDescription>
                  Sign in to your account or create a new one
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="register">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          required
                          data-testid="input-email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="loginPassword">Password</Label>
                        <div className="relative">
                          <Input
                            id="loginPassword"
                            type={showLoginPassword ? "text" : "password"}
                            value={loginForm.password}
                            onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                          >
                            {showLoginPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-lautech-blue hover:bg-lautech-blue/90"
                        disabled={loginMutation.isPending}
                        data-testid="button-login"
                      >
                        {loginMutation.isPending ? "Signing in..." : "Sign In"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            type="text"
                            placeholder="First name"
                            required
                            data-testid="input-firstname"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            type="text"
                            placeholder="Last name"
                            required
                            data-testid="input-lastname"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          name="username"
                          type="text"
                          placeholder="Choose a username"
                          required
                          data-testid="input-username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          required
                          data-testid="input-register-email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="registerPassword">Password</Label>
                        <div className="relative">
                          <Input
                            id="registerPassword"
                            type={showRegisterPassword ? "text" : "password"}
                            value={registerForm.password}
                            onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                          >
                            {showRegisterPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          placeholder="Confirm your password"
                          required
                          data-testid="input-confirm-password"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-lautech-blue hover:bg-lautech-blue/90"
                        disabled={registerMutation.isPending}
                        data-testid="button-register"
                      >
                        {registerMutation.isPending ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Hero Section */}
          <div className="flex flex-col justify-center">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Your Gateway to Academic Excellence
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Access courses, connect with faculty, participate in discussions, and manage your academic journey at LAUTECH.
              </p>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <Users className="h-8 w-8 text-lautech-blue mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Faculty Directory</h3>
                  <p className="text-sm text-gray-600">Connect with professors and academic staff</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <BookOpen className="h-8 w-8 text-lautech-blue mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Course Materials</h3>
                  <p className="text-sm text-gray-600">Access quizzes, assignments, and resources</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <Calendar className="h-8 w-8 text-lautech-blue mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Events & News</h3>
                  <p className="text-sm text-gray-600">Stay updated with campus activities</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <MessageSquare className="h-8 w-8 text-lautech-blue mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">AI Assistant</h3>
                  <p className="text-sm text-gray-600">Get help with academic questions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}