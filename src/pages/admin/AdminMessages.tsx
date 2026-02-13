import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Trash2, Eye, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const AdminMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
    } catch (err) {
      toast.error('Failed to update message');
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMessages(prev => prev.filter(m => m.id !== id));
      toast.success('Message deleted');
    } catch (err) {
      toast.error('Failed to delete message');
    }
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MessageSquare className="h-8 w-8" />
              Contact Messages
            </h1>
            <p className="text-muted-foreground mt-1">
              {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All messages read'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-muted-foreground">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">No messages yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <Card key={msg.id} className={`transition-all ${!msg.is_read ? 'border-primary/50 bg-primary/5' : ''}`}>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{msg.name}</h3>
                        {!msg.is_read && <Badge variant="default" className="text-xs">New</Badge>}
                      </div>
                      <a href={`tel:${msg.phone}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                        <Phone className="h-4 w-4" />
                        {msg.phone}
                      </a>
                      <p className="text-foreground whitespace-pre-wrap">{msg.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(msg.created_at).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {!msg.is_read && (
                        <Button variant="outline" size="sm" onClick={() => markAsRead(msg.id)}>
                          <Eye className="h-4 w-4 mr-1" /> Read
                        </Button>
                      )}
                      <Button variant="destructive" size="sm" onClick={() => deleteMessage(msg.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMessages;
