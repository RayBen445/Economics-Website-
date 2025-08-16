import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  GraduationCap, 
  Home, 
  MessageSquare, 
  Calendar, 
  Users, 
  Bell,
  ChevronDown,
  User,
  Settings,
  Shield,
  LogOut
} from "lucide-react";
import { Link } from "wouter";

export default function Navigation() {
  const { user } = useAuth();

  const { data: siteSettings } = useQuery({
    queryKey: ["/api/site-settings"],
    retry: false,
  });

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-10 h-10 bg-lautech-blue rounded-lg flex items-center justify-center">
                <GraduationCap className="text-white text-lg" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">
                  {(siteSettings as any)?.siteName || "LAUTECH Portal"}
                </h1>
                <p className="text-xs text-gray-600">Academic Management System</p>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Button
              variant="ghost"
              className="text-gray-700 hover:text-lautech-blue"
              onClick={() => window.location.href = '/'}
            >
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className="text-gray-700 hover:text-lautech-blue"
              onClick={() => window.location.href = '/chat'}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat
            </Button>
            <Button
              variant="ghost"
              className="text-gray-700 hover:text-lautech-blue"
              onClick={() => window.location.href = '/events'}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Events
            </Button>
            <Button
              variant="ghost"
              className="text-gray-700 hover:text-lautech-blue"
              onClick={() => window.location.href = '/faculty'}
            >
              <Users className="mr-2 h-4 w-4" />
              Faculty
            </Button>
            <Link href="/quizzes" className="text-gray-700 hover:text-lautech-blue">
              Quizzes
            </Link>
            <Link href="/ai-chat" className="text-gray-700 hover:text-lautech-blue">
              AI Chat
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-lautech-blue">
                <Bell className="h-5 w-5" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs"
                >
                  3
                </Badge>
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 hover:bg-gray-50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl} alt={user?.firstName} />
                    <AvatarFallback>
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => window.location.href = '/profile'}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                {user?.isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.location.href = '/admin'}>
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.location.href = '/api/logout'}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}