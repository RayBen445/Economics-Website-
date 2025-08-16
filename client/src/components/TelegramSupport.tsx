
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TelegramSupport() {
  const { toast } = useToast();
  const [supportForm, setSupportForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate sending to Telegram bot
      const telegramMessage = `
🆘 *LAUTECH Portal Support Request*

👤 **Name:** ${supportForm.name}
📧 **Email:** ${supportForm.email}
💬 **Message:** ${supportForm.message}

⏰ **Time:** ${new Date().toLocaleString()}
      `;

      // In a real implementation, you would send this to your Telegram bot
      console.log("Telegram message:", telegramMessage);

      toast({
        title: "Support Request Sent",
        description: "Your message has been sent to our Telegram support team. We'll get back to you soon!",
      });

      setSupportForm({ name: "", email: "", message: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send support request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openTelegramChannel = () => {
    // Replace with your actual Telegram channel/group link
    window.open("https://t.me/lautech_portal_support", "_blank");
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-blue-500" />
          <span>Telegram Support</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button 
            onClick={openTelegramChannel}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Join Support Channel
          </Button>
          <p className="text-xs text-gray-500 text-center">
            Click to join our Telegram support channel for instant help
          </p>
        </div>

        <div className="border-t pt-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Input
                placeholder="Your name"
                value={supportForm.name}
                onChange={(e) => setSupportForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Input
                type="email"
                placeholder="Your email"
                value={supportForm.email}
                onChange={(e) => setSupportForm(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <Textarea
                placeholder="Describe your issue..."
                value={supportForm.message}
                onChange={(e) => setSupportForm(prev => ({ ...prev, message: e.target.value }))}
                required
                rows={3}
              />
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Sending..." : "Send to Telegram"}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
