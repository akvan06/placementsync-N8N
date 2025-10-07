import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { WhatsAppForm } from "@/components/dashboard/WhatsAppForm";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>("");
  const [existingWhatsApp, setExistingWhatsApp] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/");
        return;
      }

      const email = session.user.email || "";
      setUserEmail(email);

      // Check if user has already entered WhatsApp
      const { data, error } = await supabase
        .from('users')
        .select('whatsapp')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user data:", error);
      } else if (data) {
        setExistingWhatsApp(data.whatsapp || "");
      }

      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-muted">
      {/* Navigation */}
      <nav className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-primary">PlacementSync</h1>
            </div>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* User Info */}
          <div className="flex items-center space-x-3 bg-card p-4 rounded-lg shadow-sm border border-border">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Signed in as</p>
              <p className="font-medium text-foreground">{userEmail}</p>
            </div>
          </div>

          {/* WhatsApp Form */}
          <div className="flex justify-center">
            <WhatsAppForm 
              userEmail={userEmail} 
              existingWhatsApp={existingWhatsApp}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;