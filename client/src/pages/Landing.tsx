import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, BookOpen, Calendar, MessageSquare, Shield } from "lucide-react";

export default function Landing() {
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
            
            <div className="flex items-center">
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-lautech-blue hover:bg-lautech-blue/90 text-white"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="lautech-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="text-white">
              <h2 className="text-4xl font-bold mb-4">Welcome to LAUTECH Academic Portal</h2>
              <p className="text-xl text-blue-100 mb-6">
                Your comprehensive university management system for students, faculty, and administration.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
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
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-white text-lautech-blue hover:bg-gray-100 font-semibold px-8 py-3"
              >
                Get Started
              </Button>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="University campus with students" 
                className="rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need for Academic Success
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our comprehensive platform provides all the tools and resources needed for modern university management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="text-green-600 text-xl" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Real-time Chat</h4>
              <p className="text-gray-600">
                Connect with classmates and faculty through organized chat channels for different courses and topics.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="text-blue-600 text-xl" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Document Library</h4>
              <p className="text-gray-600">
                Access and share academic resources, assignments, and research materials in a centralized library.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="text-purple-600 text-xl" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Event Calendar</h4>
              <p className="text-gray-600">
                Stay updated with academic conferences, seminars, and important university events.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-yellow-600 text-xl" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Faculty Directory</h4>
              <p className="text-gray-600">
                Find and connect with faculty members across all departments with detailed contact information.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="text-red-600 text-xl" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Admin Management</h4>
              <p className="text-gray-600">
                Comprehensive user management and content moderation tools for administrators.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <GraduationCap className="text-indigo-600 text-xl" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Academic Excellence</h4>
              <p className="text-gray-600">
                Tools and resources designed to support academic achievement and research collaboration.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Join the LAUTECH Community?
            </h3>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Access all the tools and resources you need for academic success. Connect with peers, 
              access resources, and stay updated with university activities.
            </p>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-lautech-blue hover:bg-lautech-blue/90 text-white font-semibold px-8 py-3 text-lg"
            >
              Sign In to Get Started
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 LAUTECH Academic Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
