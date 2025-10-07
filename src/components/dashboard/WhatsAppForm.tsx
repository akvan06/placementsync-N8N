import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface WhatsAppFormProps {
  userEmail: string;
  existingWhatsApp?: string;
}

export const WhatsAppForm = ({ userEmail, existingWhatsApp }: WhatsAppFormProps) => {
  const [whatsapp, setWhatsapp] = useState(existingWhatsApp || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!whatsapp.trim()) {
      toast.error("Please enter your WhatsApp number");
      return;
    }

    // Basic validation for phone number (10-15 digits)
    const phoneRegex = /^\+?[\d\s-]{10,15}$/;
    if (!phoneRegex.test(whatsapp)) {
      toast.error("Please enter a valid WhatsApp number");
      return;
    }

    setLoading(true);

    try {
      // Save to Supabase
      const { error: dbError } = await supabase
        .from('users')
        .upsert(
          { email: userEmail, whatsapp },
          { onConflict: 'email' }
        );

      if (dbError) {
        console.error("Database error:", dbError);
        toast.error("Failed to save WhatsApp number");
        return;
      }

      // Call edge function to notify n8n
      const { error: functionError } = await supabase.functions.invoke('notify-n8n', {
        body: { email: userEmail, whatsapp }
      });

      if (functionError) {
        console.error("Edge function error:", functionError);
        toast.warning("Saved locally, but failed to sync with automation");
        return;
      }

      toast.success("WhatsApp number saved successfully!");
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle>Update Your WhatsApp</CardTitle>
        <CardDescription>
          Enter your WhatsApp number to receive placement updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp Number</Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder="+91 98765 43210"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              disabled={loading}
              className="text-base"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save WhatsApp Number"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};