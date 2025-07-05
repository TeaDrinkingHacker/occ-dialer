
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import ContactsList from "@/components/ContactsList";
import { Contact, CallSession } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dialer");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (user?.role === 'admin') {
      window.location.href = '/admin';
    }
  }, [user]);

  const { data: callSessions = [] } = useQuery({
    queryKey: ['callSessions'],
    queryFn: async () => {
      console.log('Fetching call sessions for user:', user?.id, 'role:', user?.role);
      const { data, error } = await supabase
        .from('call_sessions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Call sessions error:', error);
        throw error;
      }
      
      console.log('Raw call sessions data:', data);
      console.log('Number of call sessions:', data?.length || 0);
      return data as CallSession[];
    },
    enabled: !!user
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      // Map database fields to Contact interface
      return data.map(contact => ({
        ...contact,
        firstName: contact.first_name,
        lastName: contact.last_name,
        call_initiated: contact.call_initiated ?? false
      })) as Contact[];
    },
    enabled: !!user
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user is admin, they should be redirected to admin dashboard
  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="container mx-auto px-4 py-8">
        <ContactsList contacts={contacts} callSessions={callSessions} />
      </main>
      <footer className="text-center py-4 text-muted-foreground text-sm">
        OCC Secure Dialer v1.2 - All calls are logged and monitored for quality assurance
      </footer>
    </div>
  );
};

export default Index;
