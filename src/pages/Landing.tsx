import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GoogleSignIn } from "@/components/auth/GoogleSignIn";

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-muted relative overflow-hidden">
      {/* Decorative dots pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full" 
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl text-center space-y-8 animate-in fade-in duration-700">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-in slide-in-from-bottom-4 duration-700">
              PlacementSync
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-lg mx-auto animate-in slide-in-from-bottom-5 duration-700 delay-150">
              Placement updates made simple.
            </p>
            <p className="text-base text-muted-foreground animate-in slide-in-from-bottom-6 duration-700 delay-200">
              VIT Bhopal students • Stay updated via WhatsApp
            </p>
          </div>

          <div className="pt-8 animate-in slide-in-from-bottom-7 duration-700 delay-300">
            <GoogleSignIn />
          </div>

          <p className="text-sm text-muted-foreground animate-in fade-in duration-700 delay-500">
            Sign in with your VIT Bhopal email (@vitbhopal.ac.in)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;