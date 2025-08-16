import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import FileUpload from "@/components/FileUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Camera,
  Save,
  Edit3
} from "lucide-react";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
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
  }, [isAuthenticated, authLoading, toast]);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      bio: user?.bio || "",
    },
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username || "",
        bio: user.bio || "",
      });
    }
  }, [user, form]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return await apiRequest("PUT", "/api/user/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
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
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handleImageUpload = (url: string) => {
    setProfileImage(url);
    // TODO: Update profile image via API
    toast({
      title: "Success",
      description: "Profile image uploaded successfully",
    });
  };

  if (authLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture and Basic Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Profile Picture</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="w-32 h-32">
                      <AvatarImage 
                        src={profileImage || user?.profileImageUrl} 
                        alt={user?.firstName} 
                      />
                      <AvatarFallback className="text-2xl">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 bg-lautech-blue rounded-full p-2">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </h3>
                    {user?.username && (
                      <p className="text-gray-600">@{user.username}</p>
                    )}
                    <div className="flex justify-center mt-2">
                      {user?.isAdmin && (
                        <Badge className="bg-lautech-blue">
                          <Shield className="w-3 h-3 mr-1" />
                          {user.adminLevel === 2 ? "Super Admin" : "Admin"}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <FileUpload
                    onUpload={handleImageUpload}
                    accept="image/*"
                    maxSize={5 * 1024 * 1024} // 5MB
                  >
                    <Button variant="outline" className="w-full">
                      <Camera className="w-4 h-4 mr-2" />
                      Upload New Picture
                    </Button>
                  </FileUpload>
                </div>

                <div className="border-t pt-6">
                  <div className="space-y-4 text-sm">
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{user?.email}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Edit3 className="w-5 h-5" />
                    <span>Profile Information</span>
                  </CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                    disabled={updateProfileMutation.isPending}
                  >
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <Input
                          value={user?.firstName || ""}
                          disabled
                          className="bg-gray-50"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Name is managed by your authentication provider
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <Input
                          value={user?.lastName || ""}
                          disabled
                          className="bg-gray-50"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Name is managed by your authentication provider
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <Input
                        value={user?.email || ""}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Email is managed by your authentication provider
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Choose a unique username"
                              disabled={!isEditing}
                              className={!isEditing ? "bg-gray-50" : ""}
                            />
                          </FormControl>
                          <p className="text-xs text-gray-500">
                            This will be your public username on the platform
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Tell others about yourself..."
                              disabled={!isEditing}
                              className={!isEditing ? "bg-gray-50" : ""}
                              rows={4}
                            />
                          </FormControl>
                          <p className="text-xs text-gray-500">
                            Brief description about yourself (max 500 characters)
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {isEditing && (
                      <div className="flex justify-end space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            form.reset();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={updateProfileMutation.isPending}
                          className="bg-lautech-blue hover:bg-lautech-blue/90"
                        >
                          {updateProfileMutation.isPending ? (
                            "Saving..."
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Account Status</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                  
                  {user?.isAdmin && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Admin Level</span>
                      <Badge className="bg-lautech-blue">
                        Level {user.adminLevel}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Member Since</span>
                    <span className="text-gray-600">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Last Updated</span>
                    <span className="text-gray-600">
                      {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "Never"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
