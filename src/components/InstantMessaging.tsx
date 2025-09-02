import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, User } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  message: string;
  sender_id: string;
  reservation_id: string;
  created_at: string;
  is_read: boolean;
  sender?: {
    first_name?: string;
    last_name?: string;
  };
}

interface InstantMessagingProps {
  reservationId: string;
  otherUserId: string;
  otherUserName: string;
}

const InstantMessaging = ({ reservationId, otherUserId, otherUserName }: InstantMessagingProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("reservation_id", reservationId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Erreur fetchMessages:", error);
        return;
      }

      // Enrichir avec les données des expéditeurs
      const enrichedMessages = await Promise.all(
        (data || []).map(async (msg) => {
          const { data: senderData } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("user_id", msg.sender_id)
            .single();

          return {
            ...msg,
            sender: senderData
          };
        })
      );

      setMessages(enrichedMessages);
      
      // Compter les messages non lus de l'autre utilisateur
      const unread = enrichedMessages.filter(
        msg => msg.sender_id === otherUserId && !msg.is_read
      ).length;
      setUnreadCount(unread);

      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Erreur fetchMessages:", error);
    }
  };

  const markMessagesAsRead = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("reservation_id", reservationId)
        .eq("sender_id", otherUserId);
      
      setUnreadCount(0);
    } catch (error) {
      console.error("Erreur markMessagesAsRead:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("messages")
        .insert({
          message: newMessage.trim(),
          sender_id: user.id,
          reservation_id: reservationId,
        });

      if (error) {
        toast.error("Erreur lors de l'envoi du message");
        console.error(error);
        return;
      }

      // Créer une notification pour l'autre utilisateur
      await supabase
        .from("notifications")
        .insert({
          user_id: otherUserId,
          type: "message_received",
          title: "Nouveau message",
          message: `Vous avez reçu un nouveau message`,
          data: { reservation_id: reservationId }
        });

      setNewMessage("");
      fetchMessages();
    } catch (error) {
      console.error("Erreur sendMessage:", error);
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Configuration du real-time
    const channel = supabase
      .channel(`messages-${reservationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `reservation_id=eq.${reservationId}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [reservationId, user]);

  useEffect(() => {
    if (isOpen) {
      markMessagesAsRead();
    }
  }, [isOpen]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="card-modern">
      <CardHeader 
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Messages avec {otherUserName}
          </CardTitle>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="space-y-4">
          <ScrollArea className="h-64">
            <div className="space-y-3 pr-4">
              {messages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucun message pour le moment
                </p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender_id === user?.id ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        msg.sender_id === user?.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-3 h-3" />
                        <span className="text-xs opacity-75">
                          {msg.sender_id === user?.id 
                            ? "Vous" 
                            : `${msg.sender?.first_name} ${msg.sender?.last_name}`
                          }
                        </span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Tapez votre message..."
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              disabled={loading}
            />
            <Button 
              onClick={sendMessage} 
              disabled={loading || !newMessage.trim()}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default InstantMessaging;