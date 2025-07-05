
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Save } from "lucide-react";

const CallerNumberSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [callerNumber, setCallerNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserSettings();
    }
  }, [user]);

  const fetchUserSettings = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_ringcentral_settings')
        .select('caller_number')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user settings:', error);
        return;
      }
      
      if (data) {
        setCallerNumber(data.caller_number);
      }
    } catch (error) {
      console.error('Error fetching user settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !callerNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid caller number",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      // First, try to update existing record
      const { data: existingData, error: fetchError } = await supabase
        .from('user_ringcentral_settings')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let result;
      if (existingData) {
        // Update existing record
        result = await supabase
          .from('user_ringcentral_settings')
          .update({ caller_number: callerNumber.trim() })
          .eq('user_id', user.id);
      } else {
        // Insert new record
        result = await supabase
          .from('user_ringcentral_settings')
          .insert({
            user_id: user.id,
            caller_number: callerNumber.trim()
          });
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: "Success",
        description: "Caller number updated successfully"
      });
    } catch (error) {
      console.error('Error saving caller number:', error);
      toast({
        title: "Error",
        description: "Failed to save caller number",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    // Allow users to type freely, just clean up the input
    const cleaned = value.replace(/[^\d+\-\(\)\s]/g, '');
    setCallerNumber(cleaned);
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="w-5 h-5" />
            <span>Caller ID Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Phone className="w-5 h-5" />
          <span>Telephone Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="caller-number">Your Number</Label>
          <div className="flex space-x-2">
            <Input
              id="caller-number"
              type="tel"
              placeholder="+1234567890"
              value={callerNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleSave}
              disabled={isSaving || !callerNumber.trim()}
              className="flex items-center justify-between space-x-2 bg-green-500/10 text-green-600 hover:bg-green-500/20 border border-green-500/20 min-w-[100px]"
              variant="outline"
            >
              <Save className="w-4 h-4" />
              <span className="flex-1 text-center">{isSaving ? "Saving..." : "Save"}</span>
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            This number you will receive the outgoing calls. Format: +1234567890
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CallerNumberSettings;
