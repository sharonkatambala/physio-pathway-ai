import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Send, 
  Video, 
  Phone,
  Calendar,
  Clock,
  User,
  Bot,
  Paperclip,
  MoreVertical
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'patient' | 'physiotherapist' | 'ai';
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'video' | 'appointment';
}

const ChatSystem = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'physiotherapist',
      content: 'Hi Sarah! I reviewed your progress video from yesterday. Your form is improving nicely! Keep focusing on the slow, controlled movements we discussed.',
      timestamp: '10:30 AM',
      type: 'text'
    },
    {
      id: '2',
      sender: 'patient',
      content: 'Thank you! I felt much more stable during the exercises. Should I increase the repetitions next week?',
      timestamp: '10:45 AM',
      type: 'text'
    },
    {
      id: '3',
      sender: 'ai',
      content: 'Based on your consistent performance this week, you\'re ready to progress. I recommend increasing from 2 to 3 sets while maintaining the same intensity level.',
      timestamp: '10:47 AM',
      type: 'text'
    },
    {
      id: '4',
      sender: 'physiotherapist',
      content: 'That sounds perfect! Let\'s schedule a follow-up session next week to assess your progress and adjust the plan if needed.',
      timestamp: '11:00 AM',
      type: 'text'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [activeChat, setActiveChat] = useState('physiotherapist');

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: 'patient',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const chatContacts = [
    {
      id: 'physiotherapist',
      name: 'Dr. Emily Rodriguez',
      role: 'Your Physiotherapist',
      avatar: '',
      status: 'online',
      lastMessage: 'Let\'s schedule a follow-up session...',
      lastMessageTime: '11:00 AM',
      unreadCount: 0
    },
    {
      id: 'ai',
      name: 'FIZIO AI Assistant',
      role: 'AI Health Assistant',
      avatar: '',
      status: 'online',
      lastMessage: 'Based on your consistent performance...',
      lastMessageTime: '10:47 AM',
      unreadCount: 1
    }
  ];

  const quickActions = [
    { 
      icon: Calendar, 
      label: 'Book Appointment', 
      action: () => console.log('Book appointment') 
    },
    { 
      icon: Video, 
      label: 'Video Call', 
      action: () => console.log('Start video call') 
    },
    { 
      icon: Phone, 
      label: 'Voice Call', 
      action: () => console.log('Start voice call') 
    }
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
      {/* Chat Contacts List */}
      <Card className="shadow-card lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1">
            {chatContacts.map((contact) => (
              <div 
                key={contact.id}
                className={`p-4 cursor-pointer hover:bg-muted/50 border-b transition-colors ${
                  activeChat === contact.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                }`}
                onClick={() => setActiveChat(contact.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={contact.avatar} />
                      <AvatarFallback>
                        {contact.id === 'ai' ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                      </AvatarFallback>
                    </Avatar>
                    {contact.status === 'online' && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{contact.name}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">{contact.lastMessageTime}</span>
                        {contact.unreadCount > 0 && (
                          <Badge className="bg-primary text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                            {contact.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{contact.role}</p>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {contact.lastMessage}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="shadow-card lg:col-span-2 flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {activeChat === 'ai' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">
                  {chatContacts.find(c => c.id === activeChat)?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {chatContacts.find(c => c.id === activeChat)?.role}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {quickActions.map((action, index) => (
                <Button key={index} size="sm" variant="ghost" onClick={action.action}>
                  <action.icon className="h-4 w-4" />
                </Button>
              ))}
              <Button size="sm" variant="ghost">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Messages Area */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={`flex ${message.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-start space-x-2 max-w-[80%]">
                {message.sender !== 'patient' && (
                  <Avatar className="h-6 w-6 mt-1">
                    <AvatarFallback className="text-xs">
                      {message.sender === 'ai' ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`rounded-lg p-3 ${
                  message.sender === 'patient' 
                    ? 'bg-primary text-white' 
                    : message.sender === 'ai'
                    ? 'bg-accent/10 border border-accent/20'
                    : 'bg-muted'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs ${
                      message.sender === 'patient' ? 'text-white/70' : 'text-muted-foreground'
                    }`}>
                      {message.timestamp}
                    </span>
                    {message.sender === 'ai' && (
                      <Badge variant="secondary" className="text-xs ml-2">AI</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="ghost">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1"
            />
            <Button size="sm" onClick={sendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatSystem;