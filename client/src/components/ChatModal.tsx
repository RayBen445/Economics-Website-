import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Hash, Send, Users as UsersIcon, X } from "lucide-react";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const { user } = useAuth();
  const { isConnected, sendMessage } = useWebSocket();
  const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");

  // Fetch channels
  const { data: channels = [], isLoading: channelsLoading } = useQuery({
    queryKey: ["/api/chat/channels"],
    enabled: isOpen,
    retry: false,
  });

  // Fetch messages for selected channel
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/chat/messages", selectedChannelId],
    enabled: !!selectedChannelId && isOpen,
    retry: false,
  });

  // Auto-select first channel
  useEffect(() => {
    if (channels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channels[0].id);
    }
  }, [channels, selectedChannelId]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedChannelId || !user) return;
    
    // Send via WebSocket for real-time delivery
    if (isConnected) {
      sendMessage({
        type: 'chat_message',
        channelId: selectedChannelId,
        content: messageText.trim(),
        userId: user.id,
      });
      setMessageText("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const selectedChannel = channels.find((c: any) => c.id === selectedChannelId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[600px] flex flex-col p-0">
        <DialogHeader className="flex items-center justify-between p-4 border-b border-gray-200">
          <DialogTitle className="flex items-center space-x-2">
            <Hash className="h-5 w-5 text-gray-400" />
            <span>LAUTECH Chat Rooms</span>
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Channels Sidebar */}
          <div className="w-1/4 border-r border-gray-200 bg-gray-50">
            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Hash className="mr-2 h-4 w-4" />
                Channels
              </h4>
              <div className="flex items-center mb-3 text-sm text-gray-500">
                <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
              
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
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
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
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
                      disabled={!isConnected}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || !isConnected}
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
