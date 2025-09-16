import { Phone, Video, MessageCircle, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInitials } from "../../utils";

interface CallDetailViewProps {
  callId?: string;
}

const mockCallDetails = {
  '1': {
    name: 'Zahra❤️',
    avatar: '',
    phoneNumber: '+62 812 3456 7890',
    lastCall: '2 minutes ago',
    callHistory: [
      { date: 'Today', calls: [
        { time: '2:30 PM', type: 'outgoing', duration: '5:23', status: 'completed' },
        { time: '10:15 AM', type: 'incoming', duration: '2:45', status: 'completed' },
      ]},
      { date: 'Yesterday', calls: [
        { time: '8:20 PM', type: 'outgoing', duration: '15:30', status: 'completed' },
        { time: '3:45 PM', type: 'incoming', duration: '', status: 'missed' },
      ]},
    ]
  },
  '2': {
    name: 'JUSMAR',
    avatar: '',
    phoneNumber: '+62 821 9876 5432',
    lastCall: '1 hour ago',
    callHistory: [
      { date: 'Today', calls: [
        { time: '5:45 PM', type: 'incoming', duration: '', status: 'missed' },
      ]},
    ]
  }
};

export function CallDetailView({ callId }: CallDetailViewProps) {
  if (!callId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <Phone className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-xl font-medium text-foreground mb-2">
            Make voice and video calls
          </h2>
          <p className="text-muted-foreground text-sm">
            Search for a contact to start calling
          </p>
        </div>
      </div>
    );
  }

  const contact = mockCallDetails[callId as keyof typeof mockCallDetails];
  if (!contact) return null;

  const handleVoiceCall = () => {
    console.log('Starting voice call with', contact.name);
  };

  const handleVideoCall = () => {
    console.log('Starting video call with', contact.name);
  };

  const handleMessage = () => {
    console.log('Opening chat with', contact.name);
  };

  return (
    <div className="flex-1 bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Contact Header */}
        <Card>
          <CardHeader className="text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarFallback className="bg-primary/10 text-primary font-medium text-2xl">
                {getInitials(contact.name)}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{contact.name}</CardTitle>
            <p className="text-muted-foreground">{contact.phoneNumber}</p>
            <p className="text-sm text-muted-foreground">Last call: {contact.lastCall}</p>
          </CardHeader>
          
          <CardContent className="flex justify-center gap-4">
            <Button 
              onClick={handleVoiceCall}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90"
            >
              <Phone className="h-4 w-4" />
              Voice Call
            </Button>
            <Button 
              onClick={handleVideoCall}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Video className="h-4 w-4" />
              Video Call
            </Button>
            <Button 
              onClick={handleMessage}
              variant="outline"
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Message
            </Button>
          </CardContent>
        </Card>

        {/* Call History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PhoneCall className="h-5 w-5" />
              Call History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contact.callHistory.map((day, dayIndex) => (
              <div key={dayIndex}>
                <h4 className="font-medium text-muted-foreground mb-2">{day.date}</h4>
                <div className="space-y-2">
                  {day.calls.map((call, callIndex) => (
                    <div 
                      key={callIndex}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          call.status === 'missed' ? 'bg-red-500' : 'bg-green-500'
                        }`} />
                        <span className="text-sm">
                          {call.type === 'incoming' ? 'Incoming' : 'Outgoing'} call
                        </span>
                        <span className="text-sm text-muted-foreground">{call.time}</span>
                      </div>
                      {call.duration && (
                        <span className="text-sm text-muted-foreground">{call.duration}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
