
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { Bot, Send, User } from "lucide-react";

interface ChatMessage {
  id: string;
  userMessage: string;
  aiResponse: string;
  timestamp: string;
}

export default function AIChat() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState(() => `session_${Date.now()}`);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch chat history
  const { data: chatHistory = [], refetch } = useQuery({
    queryKey: ["/api/ai-chat/history", sessionId],
    queryFn: () => apiRequest("GET", `/api/ai-chat/history?sessionId=${sessionId}`),
    enabled: isAuthenticated,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (messageData: { message: string; sessionId: string }) =>
      apiRequest("POST", "/api/ai-chat", messageData),
    onSuccess: () => {
      refetch();
      setMessage("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendMessageMutation.mutate({
      message: message.trim(),
      sessionId,
    });
  };

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [chatHistory]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6">
          <p className="text-center text-gray-600">Please log in to access AI Chat</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Assistant</h1>
          <p className="text-gray-600">Ask me anything about LAUTECH or academic topics!</p>
        </div>

        <Card className="h-[600px] flex flex-col">
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {chatHistory.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-gray-500">
                    <div className="text-center">
                      <Bot className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p>Start a conversation with the AI assistant!</p>
                    </div>
                  </div>
                ) : (
                  chatHistory.map((chat: ChatMessage) => (
                    <div key={chat.id} className="space-y-3">
                      {/* User Message */}
                      <div className="flex justify-end">
                        <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                          <div className="bg-blue-500 text-white rounded-lg px-3 py-2">
                            <p className="text-sm">{chat.userMessage}</p>
                          </div>
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-blue-500 text-white">
                              <User className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                      
                      {/* AI Response */}
                      <div className="flex justify-start">
                        <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-green-500 text-white">
                              <Bot className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="bg-gray-100 rounded-lg px-3 py-2">
                            <p className="text-sm text-gray-800">{chat.aiResponse}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            
            <form onSubmit={handleSendMessage} className="border-t p-4">
              <div className="flex space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask me anything..."
                  disabled={sendMessageMutation.isPending}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
