import { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Message {
  id: string;
  reservation_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    first_name: string;
    last_name: string;
  };
}

interface ChatComponentProps {
  reservationId: string;
  otherUserId: string;  
  otherUserName: string;
}

const ChatComponent = ({ reservationId, otherUserId, otherUserName }: ChatComponentProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("reservation_id", reservationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Erreur chargement messages:", error);
      return;
    }

    // Récupérer les infos des expéditeurs séparément
    const messagesWithSenders = await Promise.all(
      (data || []).map(async (message) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("user_id", message.sender_id)
          .single();
        
        return {
          ...message,
          sender: profile
        };
      })
    );

    setMessages(messagesWithSenders);
    
    // Compter les messages non lus de l'autre utilisateur
    const unread = (data || []).filter(msg => 
      msg.sender_id !== user?.id && !msg.is_read
    ).length;
    setUnreadCount(unread);
  };

  const markMessagesAsRead = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("reservation_id", reservationId)
      .eq("sender_id", otherUserId)
      .eq("is_read", false);

    if (!error) {
      setUnreadCount(0);
    }
  };

  const sendMessage = async () => {
    if (!user || !newMessage.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("messages")
        .insert({
          reservation_id: reservationId,
          sender_id: user.id,
          message: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage("");
      fetchMessages();
      
      // Créer une notification pour l'autre utilisateur
      await supabase.from("notifications").insert({
        user_id: otherUserId,
        type: "message_received",
        title: "Nouveau message",
        message: `${user.user_metadata?.first_name || "Un utilisateur"} vous a envoyé un message`,
        data: { reservation_id: reservationId }
      });

    } catch (error: any) {
      toast.error("Erreur envoi message : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    // S'abonner aux nouveaux messages en temps réel
    const subscription = supabase
      .channel(`messages:${reservationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `reservation_id=eq.${reservationId}`
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [reservationId]);

  useEffect(() => {
    if (isOpen) {
      markMessagesAsRead();
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      return date.toLocaleTimeString("fr-FR", { 
        hour: "2-digit", 
        minute: "2-digit" 
      });
    } else {
      return date.toLocaleDateString("fr-FR", { 
        day: "numeric", 
        month: "short",
        hour: "2-digit", 
        minute: "2-digit"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          <MessageCircle className="w-4 h-4 mr-2" />
          Chat avec {otherUserName}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 min-w-5 h-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Chat avec {otherUserName}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_id === user?.id ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender_id === user?.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender_id === user?.id
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-4 border-t">
          <Input
            placeholder="Tapez votre message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            disabled={loading}
          />
          <Button onClick={sendMessage} disabled={loading || !newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucun message encore</p>
            <p className="text-xs">Commencez la conversation !</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChatComponent;