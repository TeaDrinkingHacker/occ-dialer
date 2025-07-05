
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CallSession } from "@/types/auth";

interface CallSessionSelectorProps {
  callSessions: CallSession[];
  selectedCallSessionId: string | null;
  onCallSessionChange: (sessionId: string | null) => void;
}

const CallSessionSelector = ({ callSessions, selectedCallSessionId, onCallSessionChange }: CallSessionSelectorProps) => {
  if (callSessions.length === 0) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <label htmlFor="call-session" className="text-sm font-medium text-card-foreground">
            Select Call Session:
          </label>
          <div className="w-80 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-500">
            No call sessions available
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Contact your administrator to have call sessions created and contacts uploaded.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-4">
        <label htmlFor="call-session" className="text-sm font-medium text-card-foreground">
          Select Call Session:
        </label>
        <Select value={selectedCallSessionId || ""} onValueChange={onCallSessionChange}>
          <SelectTrigger className="w-80">
            <SelectValue placeholder="Choose a call session" />
          </SelectTrigger>
          <SelectContent>
            {callSessions.map((session) => (
              <SelectItem key={session.id} value={session.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{session.name}</span>
                  <span className="text-xs text-gray-500">
                    {session.contact_count} contacts • {new Date(session.created_at).toLocaleDateString()}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CallSessionSelector;
