import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Send, Hash, Users as UsersIcon } from "lucide-react";

export default function Chat() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");

  // Redirect if not authenticated
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

  // WebSocket connection
  const { isConnected, sendMessage } = useWebSocket();

  // Fetch channels
  const { data: channels = [], isLoading: channelsLoading } = useQuery({
    queryKey: ["/api/chat/channels"],
    retry: false,
  });

  // Fetch messages for selected channel
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/chat/messages", selectedChannelId],
    enabled: !!selectedChannelId,
    retry: false,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ channelId, content }: { channelId: number; content: string }) => {
      // Send via WebSocket for real-time delivery
      if (isConnected && user) {
        sendMessage({
          type: 'chat_message',
          channelId,
          content,
          userId: user.id,
        });
      }
    },
    onSuccess: () => {
      setMessageText("");
      // Invalidate and refetch messages
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages", selectedChannelId] });
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
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Auto-select first channel
  useEffect(() => {
    if (channels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channels[0].id);
    }
  }, [channels, selectedChannelId]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedChannelId) return;
    
    sendMessageMutation.mutate({
      channelId: selectedChannelId,
      content: messageText.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">Loading...</div>
    </div>;
  }

  const selectedChannel = channels.find((c: any) => c.id === selectedChannelId);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Chat Rooms</h1>
          <p className="text-gray-600">Connect with classmates and faculty in real-time</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
          {/* Channels Sidebar */}
          <Card className="lg:col-span-1">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Hash className="mr-2 h-4 w-4" />
                Channels
              </h3>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
            </div>
            <ScrollArea className="h-[500px]">
              <div className="p-4 space-y-2">
                {channelsLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-gray-200 h-12 rounded-lg"></div>
                    ))}
                  </div>
                ) : channels.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Hash className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                    <p className="text-sm">No channels available</p>
                  </div>
                ) : (
                  channels.map((channel: any) => (
                    <Button
                      key={channel.id}
                      variant={selectedChannelId === channel.id ? "default" : "ghost"}
                      className="w-full justify-start p-3 h-auto"
                      onClick={() => setSelectedChannelId(channel.id)}
                    >
                      <div className="flex items-center space-x-2 w-full">
                        <Hash className="h-4 w-4 text-gray-400" />
                        <div className="flex-1 text-left">
                          <div className="font-medium">{channel.name}</div>
                          <div className="text-xs text-gray-500">
                            {channel.description || 'General discussion'}
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-3 flex flex-col">
            {selectedChannel ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Hash className="h-5 w-5 text-gray-400" />
                      <h3 className="font-semibold text-gray-900">{selectedChannel.name}</h3>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <UsersIcon className="h-4 w-4" />
                      <span>Online users</span>
                    </div>
                  </div>
                  {selectedChannel.description && (
                    <p className="text-sm text-gray-600 mt-1">{selectedChannel.description}</p>
                  )}
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {messagesLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse flex space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Hash className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message: any) => (
                        <div key={message.id} className="flex space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={message.user?.profileImageUrl} alt={message.user?.firstName} />
                            <AvatarFallback>
                              {message.user?.firstName?.[0]}{message.user?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-gray-900 text-sm">
                                {message.user?.firstName} {message.user?.lastName}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(message.createdAt).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm">{message.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-3">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={`Message #${selectedChannel.name}`}
                      className="flex-1"
                      disabled={!isConnected || sendMessageMutation.isPending}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || !isConnected || sendMessageMutation.isPending}
                      className="bg-lautech-blue hover:bg-lautech-blue/90"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Hash className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>Select a channel to start chatting</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
