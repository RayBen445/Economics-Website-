import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Users, 
  Shield, 
  FileText, 
  Settings, 
  BarChart3,
  AlertTriangle,
  UserCheck,
  UserX,
  Crown,
  Search,
  Eye,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  XCircle
} from "lucide-react";

const banUserSchema = z.object({
  targetUserId: z.string().min(1, "User ID is required"),
  reason: z.string().min(1, "Reason is required"),
  duration: z.number().min(0, "Duration must be positive"),
});

const promoteUserSchema = z.object({
  targetUserId: z.string().min(1, "User ID is required"),
  adminLevel: z.number().min(1).max(2, "Admin level must be 1 or 2"),
});

type BanUserFormData = z.infer<typeof banUserSchema>;
type PromoteUserFormData = z.infer<typeof promoteUserSchema>;

export default function AdminPanel() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("users");
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user?.isAdmin)) {
      toast({
        title: "Unauthorized",
        description: "Admin access required",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, user, toast]);

  const banForm = useForm<BanUserFormData>({
    resolver: zodResolver(banUserSchema),
    defaultValues: {
      targetUserId: "",
      reason: "",
      duration: 7,
    },
  });

  const promoteForm = useForm<PromoteUserFormData>({
    resolver: zodResolver(promoteUserSchema),
    defaultValues: {
      targetUserId: "",
      adminLevel: 1,
    },
  });

  // Fetch admin users
  const { data: admins = [], isLoading: adminsLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    retry: false,
  });

  // Fetch reports
  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ["/api/admin/reports"],
    retry: false,
  });

  // Fetch site settings
  const { data: siteSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/site-settings"],
    retry: false,
  });

  // Ban user mutation
  const banUserMutation = useMutation({
    mutationFn: async (data: BanUserFormData) => {
      return await apiRequest("POST", "/api/admin/ban-user", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsBanDialogOpen(false);
      banForm.reset();
      toast({
        title: "Success",
        description: "User banned successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Error",
        description: "Failed to ban user",
        variant: "destructive",
      });
    },
  });

  // Promote user mutation
  const promoteUserMutation = useMutation({
    mutationFn: async (data: PromoteUserFormData) => {
      return await apiRequest("POST", "/api/admin/promote-user", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsPromoteDialogOpen(false);
      promoteForm.reset();
      toast({
        title: "Success",
        description: "User promoted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Error",
        description: "Failed to promote user",
        variant: "destructive",
      });
    },
  });

  const onBanSubmit = (data: BanUserFormData) => {
    banUserMutation.mutate(data);
  };

  const onPromoteSubmit = (data: PromoteUserFormData) => {
    promoteUserMutation.mutate(data);
  };

  if (authLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">Loading...</div>
    </div>;
  }

  if (!user?.isAdmin) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Shield className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-500">You need admin privileges to access this page.</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Administration Panel</h1>
          <p className="text-gray-600">Manage users, content, and system settings</p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Content</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Reports</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-red-900">User Management</h4>
                    <UserX className="text-red-600 w-5 h-5" />
                  </div>
                  <div className="space-y-2">
                    <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start text-red-700 hover:text-red-900 hover:bg-red-100">
                          <Ban className="w-4 h-4 mr-2" />
                          Ban/Restrict Users
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Ban User</DialogTitle>
                        </DialogHeader>
                        <Form {...banForm}>
                          <form onSubmit={banForm.handleSubmit(onBanSubmit)} className="space-y-4">
                            <FormField
                              control={banForm.control}
                              name="targetUserId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>User ID</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Enter user ID to ban" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={banForm.control}
                              name="reason"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Reason</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} placeholder="Reason for ban" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={banForm.control}
                              name="duration"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Duration (days, 0 for permanent)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      type="number" 
                                      min="0"
                                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="flex justify-end space-x-2">
                              <Button type="button" variant="outline" onClick={() => setIsBanDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button 
                                type="submit" 
                                disabled={banUserMutation.isPending}
                                variant="destructive"
                              >
                                {banUserMutation.isPending ? "Banning..." : "Ban User"}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                    
                    <Button variant="ghost" className="w-full justify-start text-red-700 hover:text-red-900 hover:bg-red-100">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Content Moderation
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-blue-900">Admin Controls</h4>
                    <Shield className="text-blue-600 w-5 h-5" />
                  </div>
                  <div className="space-y-2">
                    <Dialog open={isPromoteDialogOpen} onOpenChange={setIsPromoteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start text-blue-700 hover:text-blue-900 hover:bg-blue-100">
                          <Crown className="w-4 h-4 mr-2" />
                          Add/Remove Admins
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Promote User to Admin</DialogTitle>
                        </DialogHeader>
                        <Form {...promoteForm}>
                          <form onSubmit={promoteForm.handleSubmit(onPromoteSubmit)} className="space-y-4">
                            <FormField
                              control={promoteForm.control}
                              name="targetUserId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>User ID</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Enter user ID to promote" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={promoteForm.control}
                              name="adminLevel"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Admin Level</FormLabel>
                                  <Select 
                                    onValueChange={(value) => field.onChange(parseInt(value))}
                                    defaultValue={field.value?.toString()}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select admin level" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="1">Level 1 - Basic Admin</SelectItem>
                                      <SelectItem value="2">Level 2 - Super Admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="flex justify-end space-x-2">
                              <Button type="button" variant="outline" onClick={() => setIsPromoteDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button 
                                type="submit" 
                                disabled={promoteUserMutation.isPending}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                {promoteUserMutation.isPending ? "Promoting..." : "Promote User"}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                    
                    <Button variant="ghost" className="w-full justify-start text-blue-700 hover:text-blue-900 hover:bg-blue-100">
                      <UserCheck className="w-4 h-4 mr-2" />
                      Manage Roles
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-green-900">Content Management</h4>
                    <FileText className="text-green-600 w-5 h-5" />
                  </div>
                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start text-green-700 hover:text-green-900 hover:bg-green-100">
                      <Edit className="w-4 h-4 mr-2" />
                      Manage News/Posts
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-green-700 hover:text-green-900 hover:bg-green-100">
                      <FileText className="w-4 h-4 mr-2" />
                      File Management
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-yellow-900">Analytics</h4>
                    <BarChart3 className="text-yellow-600 w-5 h-5" />
                  </div>
                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start text-yellow-700 hover:text-yellow-900 hover:bg-yellow-100">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      User Activity
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-yellow-700 hover:text-yellow-900 hover:bg-yellow-100">
                      <FileText className="w-4 h-4 mr-2" />
                      System Logs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Admin Directory */}
            <Card>
              <CardHeader>
                <CardTitle>Administrator Directory</CardTitle>
              </CardHeader>
              <CardContent>
                {adminsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
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
                    <p>No administrators found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {admins.map((admin: any) => (
                      <div key={admin.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={admin.profileImageUrl} alt={admin.firstName} />
                            <AvatarFallback>
                              {admin.firstName?.[0]}{admin.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">
                              {admin.firstName} {admin.lastName}
                            </p>
                            <div className="flex items-center space-x-2">
                              <Badge variant={admin.adminLevel === 2 ? "default" : "secondary"}>
                                {admin.adminLevel === 2 ? "Super Admin" : "Admin"}
                              </Badge>
                              {admin.id === user?.id && <Badge variant="outline">You</Badge>}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>{admin.email}</p>
                          <p className="text-xs mt-1">
                            Joined: {new Date(admin.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Management Tab */}
          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>Content management features coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>User Reports</CardTitle>
              </CardHeader>
              <CardContent>
                {reportsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-gray-50 rounded-lg p-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p>No reports to review</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report: any) => (
                      <div key={report.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant={
                                report.status === "pending" ? "default" :
                                report.status === "reviewed" ? "secondary" : "outline"
                              }>
                                {report.status}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {report.reportType}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 mb-2">{report.reason}</p>
                            <p className="text-xs text-gray-500">
                              Reported: {new Date(report.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Settings className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>System settings panel coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>Analytics dashboard coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
