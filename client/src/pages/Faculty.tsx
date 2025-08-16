import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Mail, Phone, Building, Users } from "lucide-react";

export default function Faculty() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: faculty = [], isLoading } = useQuery({
    queryKey: ["/api/faculty", searchQuery],
    retry: false,
  });

  const filteredFaculty = faculty.filter((member: any) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Faculty Directory</h1>
          <p className="text-gray-600">Find and connect with faculty members across all departments</p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Search Faculty</h3>
              <Button className="bg-lautech-blue text-white hover:bg-lautech-blue/90">
                Add Faculty Member
              </Button>
            </div>
            
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by name, department, or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredFaculty.length === 0 ? (
              <div className="text-center py-12">
                {searchQuery ? (
                  <>
                    <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No faculty members found</h3>
                    <p className="text-gray-500">
                      No faculty members match your search for "{searchQuery}". Try adjusting your search terms.
                    </p>
                  </>
                ) : (
                  <>
                    <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No faculty members</h3>
                    <p className="text-gray-500">Faculty directory is currently empty.</p>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-sm text-gray-600">
                    Showing {filteredFaculty.length} faculty member{filteredFaculty.length !== 1 ? 's' : ''}
                    {searchQuery && ` for "${searchQuery}"`}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFaculty.map((member: any) => (
                    <div 
                      key={member.id} 
                      className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback className="text-lg">
                            {member.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-semibold text-gray-900 group-hover:text-lautech-blue transition-colors">
                            {member.name}
                          </h4>
                          <p className="text-sm text-gray-600 font-medium">{member.title}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Building className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                          <span>{member.department}</span>
                        </div>
                        
                        {member.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                      </div>
                      
                      {member.bio && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm text-gray-600 line-clamp-3">{member.bio}</p>
                        </div>
                      )}
                      
                      <div className="mt-4 flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => window.location.href = `mailto:${member.email}`}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Email
                        </Button>
                        {member.phone && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.location.href = `tel:${member.phone}`}
                          >
                            <Phone className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
