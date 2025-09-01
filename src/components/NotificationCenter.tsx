import { useState, useEffect } from "react";
import { Bell, Check, X, MessageCircle, Package, DollarSign, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
}

const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setNotifications(data);
      const unread = data.filter(n => !n.read).length;
      setUnreadCount(unread);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // S'abonner aux nouvelles notifications en temps réel
    if (user) {
      const subscription = supabase
        .channel(`notifications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const newNotification = payload.new as Notification;
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Afficher une toast pour les notifications importantes
            if (['delivered', 'payment_received', 'reservation_confirmed'].includes(newNotification.type)) {
              toast.success(newNotification.title, {
                description: newNotification.message
              });
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId)
      .eq("user_id", user?.id);

    if (!error) {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    setLoading(true);
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("Toutes les notifications marquées comme lues");
    }
    setLoading(false);
  };

  const deleteNotification = async (notificationId: string) => {
    const { error } = await supabase
      .from("notifications") 
      .delete()
      .eq("id", notificationId)
      .eq("user_id", user?.id);

    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success("Notification supprimée");
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons = {
      reservation_created: Package,
      reservation_confirmed: Check,
      pickup_ready: Truck,
      in_transit: Truck,
      delivered: Package,
      payment_received: DollarSign,
      message_received: MessageCircle
    };

    const IconComponent = icons[type as keyof typeof icons] || Bell;
    return <IconComponent className="w-4 h-4" />;
  };

  const getNotificationColor = (type: string) => {
    const colors = {
      reservation_created: "text-primary",
      reservation_confirmed: "text-success",
      pickup_ready: "text-warning",
      in_transit: "text-primary",
      delivered: "text-success",
      payment_received: "text-success",
      message_received: "text-accent"
    };

    return colors[type as keyof typeof colors] || "text-muted-foreground";
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffHours / 24;

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `Il y a ${diffMinutes} min`;
    } else if (diffHours < 24) {
      return `Il y a ${Math.floor(diffHours)}h`;
    } else if (diffDays < 7) {
      return `Il y a ${Math.floor(diffDays)}j`;
    } else {
      return date.toLocaleDateString("fr-FR", { 
        day: "numeric", 
        month: "short" 
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 min-w-5 h-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md h-[600px] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="secondary">{unreadCount} non lues</Badge>
              )}
            </DialogTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                disabled={loading}
              >
                Tout marquer lu
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`p-3 cursor-pointer transition-colors ${
                  !notification.read ? 'bg-primary/5 border-primary/20' : ''
                }`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full bg-muted ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm truncate">
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(notification.created_at)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    
                    {!notification.read && (
                      <div className="flex justify-end mt-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {notifications.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
            <div>
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucune notification</p>
              <p className="text-xs">Vous serez informé des mises à jour importantes</p>
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <p className="text-xs text-muted-foreground text-center">
            Les notifications sont mises à jour en temps réel
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationCenter;