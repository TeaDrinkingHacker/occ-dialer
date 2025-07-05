
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Contact } from "@/types/auth";
import { useState, useEffect } from "react";
import { Save } from "lucide-react";

interface ContactAttendanceProps {
  contact: Contact;
  onAttendingChange: (contactId: string, checked: boolean | string) => void;
  onCommentsChange: (contactId: string, comments: string) => void;
}

const ContactAttendance = ({ contact, onAttendingChange, onCommentsChange }: ContactAttendanceProps) => {
  const [localComments, setLocalComments] = useState(contact.comments || "");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Update local state when contact prop changes (e.g., when switching call sessions)
  useEffect(() => {
    setLocalComments(contact.comments || "");
    setHasUnsavedChanges(false);
  }, [contact.comments, contact.id]);

  const handleCommentsChange = (value: string) => {
    setLocalComments(value);
    setHasUnsavedChanges(value !== (contact.comments || ""));
  };

  const handleSaveComments = () => {
    if (hasUnsavedChanges) {
      console.log('Manually saving comments for contact:', contact.id, 'with value:', localComments);
      onCommentsChange(contact.id, localComments);
      setHasUnsavedChanges(false);
    }
  };

  const handleCommentsKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveComments();
    }
  };

  const handleCommentsBlur = () => {
    // Auto-save on blur if there are unsaved changes
    if (hasUnsavedChanges) {
      console.log('Auto-saving comments on blur for contact:', contact.id, 'with value:', localComments);
      onCommentsChange(contact.id, localComments);
      setHasUnsavedChanges(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id={`attend-${contact.id}`}
          checked={contact.attending === "yes"}
          onCheckedChange={(checked) => onAttendingChange(contact.id, checked)}
        />
        <label 
          htmlFor={`attend-${contact.id}`}
          className="text-sm text-muted-foreground"
        >
          Confirmed to attend
        </label>
      </div>
      <div className="w-48">
        <div className="space-y-2">
          <Textarea
            placeholder="Add comments (press Enter or click Save)"
            value={localComments}
            onChange={(e) => handleCommentsChange(e.target.value)}
            onKeyDown={handleCommentsKeyDown}
            onBlur={handleCommentsBlur}
            className="min-h-[60px] text-sm"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleSaveComments}
            disabled={!hasUnsavedChanges}
            className="w-full text-xs"
          >
            <Save className="w-3 h-3 mr-1" />
            {hasUnsavedChanges ? "Save Comments" : "Saved"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContactAttendance;
