import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Clock, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AdminBadge } from "./AdminBadge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function PrivateMessages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState({ receiverId: "", subject: "", content: "" });

  const { data: messages = [] } = useQuery({
    queryKey: ['/api/messages'],
    enabled: !!user,
  });

  const { data: conversation = [] } = useQuery({
    queryKey: ['/api/messages/conversation', selectedConversation],
    enabled: !!selectedConversation,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      await apiRequest('/api/messages', 'POST', messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      setNewMessage({ receiverId: "", subject: "", content: "" });
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Group messages by conversation
  const conversations = messages.reduce((acc: any, message: any) => {
    const otherId = message.senderId === user?.id ? message.receiverId : message.senderId;
    if (!acc[otherId]) {
      acc[otherId] = [];
    }
    acc[otherId].push(message);
    return acc;
  }, {});

  const handleSendMessage = () => {
    if (newMessage.receiverId && newMessage.content) {
      sendMessageMutation.mutate(newMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Private Messages</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Private Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Recipient User ID"
                value={newMessage.receiverId}
                onChange={(e) => setNewMessage({ ...newMessage, receiverId: e.target.value })}
              />
              <Input
                placeholder="Subject (optional)"
                value={newMessage.subject}
                onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
              />
              <Textarea
                placeholder="Message content"
                value={newMessage.content}
                onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                rows={4}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!newMessage.receiverId || !newMessage.content || sendMessageMutation.isPending}
                className="w-full"
              >
                {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversations List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(conversations).map(([otherId, msgs]: [string, any]) => {
                const latestMessage = msgs[msgs.length - 1];
                const unreadCount = msgs.filter((m: any) => !m.isRead && m.receiverId === user?.id).length;
                
                return (
                  <div
                    key={otherId}
                    onClick={() => setSelectedConversation(otherId)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedConversation === otherId 
                        ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">User {otherId}</span>
                        {unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {unreadCount}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {new Date(latestMessage.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                      {latestMessage.subject || latestMessage.content}
                    </p>
                  </div>
                );
              })}
              {Object.keys(conversations).length === 0 && (
                <p className="text-gray-500 text-center py-4">No conversations yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Conversation Details */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedConversation ? `Conversation with User ${selectedConversation}` : "Select a conversation"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedConversation ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {conversation.map((message: any) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg ${
                      message.senderId === user?.id
                        ? 'bg-blue-100 dark:bg-blue-900 ml-8'
                        : 'bg-gray-100 dark:bg-gray-800 mr-8'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        {message.senderId === user?.id ? 'You' : `User ${message.senderId}`}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {message.subject && (
                      <p className="font-medium text-sm mb-1">{message.subject}</p>
                    )}
                    <p className="text-sm">{message.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Select a conversation to view messages
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}