import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  MessageSquare, 
  Upload, 
  Calendar, 
  Send, 
  Users, 
  BookOpen,
  Clock,
  MapPin,
  Mail,
  Phone,
  Building
} from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: news = [], isLoading: newsLoading } = useQuery({
    queryKey: ["/api/news"],
    retry: false,
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events"],
    retry: false,
  });

  const { data: faculty = [], isLoading: facultyLoading } = useQuery({
    queryKey: ["/api/faculty"],
    retry: false,
  });

  const { data: admins = [], isLoading: adminsLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    retry: false,
    queryFn: async () => {
      try {
        const response = await fetch("/api/admin/users", {
          credentials: "include",
        });
        if (!response.ok) {
          if (response.status === 403) {
            return [];
          }
          throw new Error(`${response.status}: ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        if (isUnauthorizedError(error as Error)) {
          return [];
        }
        throw error;
      }
    },
  });

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <div className="lautech-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="text-white">
              <h2 className="text-4xl font-bold mb-4">Welcome to LAUTECH Academic Portal</h2>
              <p className="text-xl text-blue-100 mb-6">
                Your comprehensive university management system for students, faculty, and administration.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 min-w-[120px]">
                  <div className="text-2xl font-bold">2,847</div>
                  <div className="text-blue-100 text-sm">Active Students</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 min-w-[120px]">
                  <div className="text-2xl font-bold">156</div>
                  <div className="text-blue-100 text-sm">Faculty Members</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 min-w-[120px]">
                  <div className="text-2xl font-bold">89</div>
                  <div className="text-blue-100 text-sm">Active Courses</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="University campus" 
                className="rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Actions */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-start text-left hover:shadow-md transition-shadow"
              onClick={() => window.location.href = '/chat'}
            >
              <div className="flex items-center mb-4 w-full">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="text-green-600 text-xl" />
                </div>
                <div className="ml-3">
                  <h4 className="font-semibold text-gray-900">Join Chat</h4>
                  <p className="text-sm text-gray-500">5 active channels</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Connect with classmates and faculty members in real-time discussions.
              </p>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-start text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-4 w-full">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Upload className="text-blue-600 text-xl" />
                </div>
                <div className="ml-3">
                  <h4 className="font-semibold text-gray-900">Upload Files</h4>
                  <p className="text-sm text-gray-500">PDF, DOC, Images</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Share documents, assignments, and resources with the community.
              </p>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-start text-left hover:shadow-md transition-shadow"
              onClick={() => window.location.href = '/events'}
            >
              <div className="flex items-center mb-4 w-full">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="text-purple-600 text-xl" />
                </div>
                <div className="ml-3">
                  <h4 className="font-semibold text-gray-900">Events</h4>
                  <p className="text-sm text-gray-500">{events.length} upcoming</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                View academic conferences, seminars, and university events.
              </p>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col items-start text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-4 w-full">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Send className="text-yellow-600 text-xl" />
                </div>
                <div className="ml-3">
                  <h4 className="font-semibold text-gray-900">Support</h4>
                  <p className="text-sm text-gray-500">Via Telegram</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Get help and submit feature suggestions through our Telegram bot.
              </p>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Recent News */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent News & Announcements</h3>
                  <Button variant="ghost" size="sm" className="text-lautech-blue">
                    View All
                  </Button>
                </div>
              </div>
              <CardContent className="p-6">
                {newsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse flex space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : news.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p>No news articles available</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {news.slice(0, 3).map((article: any) => (
                      <article key={article.id} className="flex space-x-4">
                        <img 
                          src={article.imageUrl || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=100"} 
                          alt={article.title}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 mb-1">{article.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{article.excerpt}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events & Admin Directory */}
          <div className="space-y-8">
            {/* Upcoming Events */}
            <Card>
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
              </div>
              <CardContent className="p-6">
                {eventsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse flex space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p>No upcoming events</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.slice(0, 3).map((event: any) => (
                      <div key={event.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-12 h-12 bg-lautech-blue rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {new Date(event.startTime).getDate()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                          <div className="flex items-center text-xs text-gray-600 mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <MapPin className="w-3 h-3 mr-1" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Button variant="ghost" size="sm" className="w-full mt-4 text-lautech-blue">
                  View Full Calendar
                </Button>
              </CardContent>
            </Card>

            {/* Admin Directory */}
            <Card>
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Admin Directory</h3>
              </div>
              <CardContent className="p-6">
                {adminsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : admins.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p>No admin information available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {admins.slice(0, 3).map((admin: any) => (
                      <div key={admin.id} className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={admin.profileImageUrl} alt={admin.firstName} />
                          <AvatarFallback>
                            {admin.firstName?.[0]}{admin.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">
                            {admin.firstName} {admin.lastName}
                          </p>
                          <p className="text-xs text-gray-600">
                            {admin.adminLevel === 2 ? 'Main Administrator' : 'Administrator'}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Online
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Faculty Directory Preview */}
        <Card className="mb-12">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Faculty Directory</h3>
              <Button 
                onClick={() => window.location.href = '/faculty'}
                className="bg-lautech-blue text-white hover:bg-lautech-blue/90"
              >
                View All Faculty
              </Button>
            </div>
          </div>
          <CardContent className="p-6">
            {facultyLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : faculty.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>No faculty members found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {faculty.slice(0, 6).map((member: any) => (
                  <div key={member.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3 mb-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>
                          {member.name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900">{member.name}</h4>
                        <p className="text-sm text-gray-600">{member.title}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Building className="w-4 h-4 text-gray-400 mr-2" />
                        <span>{member.department}</span>
                      </div>
                      {member.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 text-gray-400 mr-2" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
