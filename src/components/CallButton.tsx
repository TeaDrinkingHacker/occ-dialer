
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { Contact } from "@/types/auth";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ringCentralService } from "@/services/ringCentralService";
import { useContactListMutations } from "@/hooks/useContactListMutations";

interface CallButtonProps {
  contact: Contact;
  onCall: (contact: Contact) => void;
  onStatusUpdate?: (status: {
    id: string;
    contactName: string;
    phone: string;
    status: 'initiating' | 'connecting' | 'ringing' | 'connected' | 'answered' | 'completed' | 'failed' | 'busy' | 'no-answer';
    progress: number;
    timestamp: Date;
    step?: string;
  }) => void;
}

const CallButton = ({ contact, onCall, onStatusUpdate }: CallButtonProps) => {
  const [isCallLoading, setIsCallLoading] = useState(false);
  const { updateContactMutation } = useContactListMutations();

  const handleCall = async () => {
    setIsCallLoading(true);
    const callId = `call-${contact.id}-${Date.now()}`;
    
    try {
      // Step 1: Set call_initiated to true at the very start
      await supabase
        .from('contacts')
        .update({ 
          call_initiated: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', contact.id);

      // Step 2: Initiating call
      onStatusUpdate?.({
        id: callId,
        contactName: `${contact.firstName} ${contact.lastName}`,
        phone: contact.phone,
        status: 'initiating',
        progress: 10,
        timestamp: new Date(),
        step: `Preparing to call ${contact.firstName} ${contact.lastName}`
      });

      // Get RingCentral config first to get the from number
      const { data: config, error } = await supabase.functions.invoke('get-ringcentral-config');
      
      if (error || !config) {
        throw new Error('RingCentral configuration not found');
      }

      console.log('RingCentral config received:', {
        clientId: config.clientId ? 'present' : 'missing',
        serverUrl: config.serverUrl,
        username: config.username ? 'present' : 'missing',
        fromNumber: config.fromNumber
      });

      // Step 3: Connecting to service
      onStatusUpdate?.({
        id: callId,
        contactName: `${contact.firstName} ${contact.lastName}`,
        phone: contact.phone,
        status: 'connecting',
        progress: 25,
        timestamp: new Date(),
        step: `Connecting to RingCentral service...`
      });

      // Step 4: Placing call
      onStatusUpdate?.({
        id: callId,
        contactName: `${contact.firstName} ${contact.lastName}`,
        phone: contact.phone,
        status: 'connecting',
        progress: 40,
        timestamp: new Date(),
        step: `Placing call to ${contact.firstName} ${contact.lastName}...`
      });

      // Use RingCentral service to make the call
      await ringCentralService.makeCall(contact.phone, config);
      
      // Step 5: Call is ringing
      onStatusUpdate?.({
        id: callId,
        contactName: `${contact.firstName} ${contact.lastName}`,
        phone: contact.phone,
        status: 'ringing',
        progress: 60,
        timestamp: new Date(),
        step: `Ringing ${contact.firstName} ${contact.lastName}...`
      });

      // Simulate call progression with more granular updates
      setTimeout(() => {
        // Step 6: Call connected
        onStatusUpdate?.({
          id: callId,
          contactName: `${contact.firstName} ${contact.lastName}`,
          phone: contact.phone,
          status: 'connected',
          progress: 75,
          timestamp: new Date(),
          step: `Call connected to ${contact.firstName} ${contact.lastName}`
        });

        // Step 7: Person answered
        setTimeout(() => {
          onStatusUpdate?.({
            id: callId,
            contactName: `${contact.firstName} ${contact.lastName}`,
            phone: contact.phone,
            status: 'answered',
            progress: 90,
            timestamp: new Date(),
            step: `${contact.firstName} ${contact.lastName} answered the call`
          });

          // Step 8: Call completed
          setTimeout(() => {
            onStatusUpdate?.({
              id: callId,
              contactName: `${contact.firstName} ${contact.lastName}`,
              phone: contact.phone,
              status: 'completed',
              progress: 100,
              timestamp: new Date(),
              step: `Call with ${contact.firstName} ${contact.lastName} completed successfully`
            });
          }, 3000);
        }, 2000);
      }, 3000);
      
      // Update status to "called" on successful call - using the new mutation hook
      await updateContactMutation.mutateAsync({
        contactId: contact.id,
        updates: { status: "called" }
      });
      
      onCall(contact);
      
    } catch (error) {
      console.error('Call failed:', error);
      
      // Reset call_initiated to false if call fails
      await supabase
        .from('contacts')
        .update({ 
          call_initiated: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', contact.id);
      
      // Update status to failed with specific error message
      onStatusUpdate?.({
        id: callId,
        contactName: `${contact.firstName} ${contact.lastName}`,
        phone: contact.phone,
        status: 'failed',
        progress: 0,
        timestamp: new Date(),
        step: `Failed to call ${contact.firstName} ${contact.lastName}: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      
      // Update status to "call failed" on error - using the new mutation hook
      await updateContactMutation.mutateAsync({
        contactId: contact.id,
        updates: { status: "call failed" }
      });
    } finally {
      setIsCallLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      onClick={handleCall}
      disabled={isCallLoading}
      className="bg-green-500 hover:bg-green-600 text-white flex items-center justify-between space-x-2 min-w-[80px]"
    >
      <Phone className="w-4 h-4" />
      <span className="flex-1 text-center">{isCallLoading ? "Calling..." : "Call"}</span>
    </Button>
  );
};

export default CallButton;
