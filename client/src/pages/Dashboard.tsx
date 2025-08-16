import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Bell, BookOpen, Calendar, MessageSquare, Users, Settings, TrendingUp, GraduationCap, Bot, FileText, Trophy, Shield } from "lucide-react";
import TelegramSupport from "@/components/TelegramSupport";


interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean;
  adminLevel?: number;
  isBanned?: boolean;
}

interface NewsItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  location?: string;
}

interface FacultyMember {
  id: string;
  name: string;
  department: string;
  email: string;
}

interface Quiz {
  id: string;
  title: string;
  isActive: boolean;
}

export default function Dashboard() {
  const { user, isLoading: userLoading, isAuthenticated } = useAuth();

  // Fetch dashboard data
  const { data: news = [], isLoading: newsLoading } = useQuery<NewsItem[]>({
    queryKey: ["/api/news"],
    queryFn: () => fetch('/api/news', { credentials: 'include' })
      .then(res => res.ok ? res.json() : [])
      .catch(() => []),
    retry: false,
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    queryFn: () => fetch('/api/events', { credentials: 'include' })
      .then(res => res.ok ? res.json() : [])
      .catch(() => []),
    retry: false,
  });

  const { data: faculty = [], isLoading: facultyLoading } = useQuery<FacultyMember[]>({
    queryKey: ["/api/faculty"],
    queryFn: () => fetch('/api/faculty', { credentials: 'include' })
      .then(res => res.ok ? res.json() : [])
      .catch(() => []),
    retry: false,
  });

  const { data: quizzes = [], isLoading: quizzesLoading } = useQuery<Quiz[]>({
    queryKey: ["/api/quizzes"],
    queryFn: () => fetch('/api/quizzes', { credentials: 'include' })
      .then(res => res.ok ? res.json() : [])
      .catch(() => []),
    retry: false,
  });

  const recentNews = news.slice(0, 3);
  const upcomingEvents = events.slice(0, 3);

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

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Welcome, {(user as User)?.firstName || (user as User)?.username || 'User'}</span>
                {(user as User)?.isAdmin && (
                  <Badge variant="default" className="bg-lautech-blue">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin {(user as User)?.adminLevel && (user as User)?.adminLevel! > 1 ? `L${(user as User)?.adminLevel}` : ''}
                  </Badge>
                )}
              </div>
              <Button variant="outline" onClick={() => {
                fetch('/api/logout', { method: 'POST' }).then(() => {
                  window.location.reload();
                });
              }}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to LAUTECH Portal</h2>
          <p className="text-gray-600">Your gateway to academic excellence and campus life</p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/faculty" data-testid="link-faculty">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6 text-center">
                <Users className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">Faculty Directory</h3>
                <p className="text-sm text-gray-600">Browse professors and staff</p>
                <div className="mt-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {faculty.length} members
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/quizzes" data-testid="link-quizzes">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6 text-center">
                <Trophy className="h-10 w-10 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">Quizzes</h3>
                <p className="text-sm text-gray-600">Test your knowledge</p>
                <div className="mt-2">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {quizzes.length} available
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/chat" data-testid="link-chat">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-10 w-10 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">Chat Channels</h3>
                <p className="text-sm text-gray-600">Join discussions</p>
                <div className="mt-2">
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    Live
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6 text-center">
              <Bot className="h-10 w-10 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">AI Assistant</h3>
              <p className="text-sm text-gray-600">Get academic help</p>
              <div className="mt-2">
                <Button
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  data-testid="button-ai-chat"
                >
                  Start Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* News Section */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-lautech-blue" />
                  Latest News
                </CardTitle>
                <CardDescription>Stay updated with campus announcements</CardDescription>
              </div>
              <Link href="/events">
                <Button variant="outline" size="sm" data-testid="button-view-all-news">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {newsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : recentNews.length > 0 ? (
                <div className="space-y-4">
                  {recentNews.map((item) => (
                    <div key={item.id} className="border-l-4 border-lautech-blue pl-4">
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.content.substring(0, 100)}...</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No news available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats & Events */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Platform Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Faculty Members</span>
                  <span className="font-semibold">{faculty.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Quizzes</span>
                  <span className="font-semibold">{quizzes.filter((q) => q.isActive).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Upcoming Events</span>
                  <span className="font-semibold">{events.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">News Articles</span>
                  <span className="font-semibold">{news.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-lautech-blue" />
                    Upcoming Events
                  </CardTitle>
                </div>
                <Link href="/events">
                  <Button variant="outline" size="sm" data-testid="button-view-all-events">
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                        <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="bg-gray-50 rounded-lg p-3">
                        <h5 className="font-medium text-sm text-gray-900">{event.title}</h5>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                        {event.location && (
                          <p className="text-xs text-gray-500">{event.location}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No upcoming events</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Features Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
            <CardContent className="p-6 text-center">
              <FileText className="h-10 w-10 text-indigo-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Private Messages</h3>
              <p className="text-sm text-gray-600 mb-4">Send direct messages to faculty and peers</p>
              <Button className="bg-indigo-600 hover:bg-indigo-700" data-testid="button-messages">
                Open Messages
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
            <CardContent className="p-6 text-center">
              <Settings className="h-10 w-10 text-pink-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Profile Settings</h3>
              <p className="text-sm text-gray-600 mb-4">Update your profile and preferences</p>
              <Link href="/profile">
                <Button className="bg-pink-600 hover:bg-pink-700" data-testid="button-profile">
                  Edit Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          {(user as User)?.isAdmin && (
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="p-6 text-center">
                <Shield className="h-10 w-10 text-red-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Admin Panel</h3>
                <p className="text-sm text-gray-600 mb-4">Manage users, content, and system settings</p>
                <Link href="/admin">
                  <Button className="bg-red-600 hover:bg-red-700" data-testid="button-admin">
                    Admin Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}