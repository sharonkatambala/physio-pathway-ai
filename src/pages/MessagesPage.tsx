import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send, User, Plus, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

type Conversation = {
  id: string;
  patient_id: string;
  physiotherapist_id: string;
  last_message_at: string | null;
};

type Msg = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

const MessagesPage = () => {
  const { user, profile, role, loading } = useAuth();
  const { language } = useLanguage();
  const tr = (en: string, sw: string) => (language === 'sw' ? sw : en);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convsLoaded, setConvsLoaded] = useState(false);
  const [names, setNames] = useState<Record<string, string>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [contacts, setContacts] = useState<{ id: string; name: string }[]>([]);
  const [showContacts, setShowContacts] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const otherId = useCallback(
    (c: Conversation) => (role === 'patient' ? c.physiotherapist_id : c.patient_id),
    [role]
  );

  const loadConversations = useCallback(async () => {
    if (!profile?.id) return;
    const { data } = await supabase
      .from('conversations')
      .select('id, patient_id, physiotherapist_id, last_message_at')
      .order('last_message_at', { ascending: false, nullsFirst: false });
    const convs = (data as Conversation[]) ?? [];
    setConversations(convs);
    setConvsLoaded(true);

    const otherIds = [...new Set(convs.map(otherId))];
    if (otherIds.length) {
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', otherIds);
      const map: Record<string, string> = {};
      (profs ?? []).forEach((p: any) => {
        map[p.id] = `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || tr('User', 'Mtumiaji');
      });
      setNames(map);
    }
  }, [profile?.id, otherId, language]);

  const loadContacts = useCallback(async () => {
    if (role !== 'patient' || !profile?.id) return;
    const { data: appts } = await supabase
      .from('appointments')
      .select('physiotherapist_id')
      .eq('patient_id', profile.id);
    const ids = [...new Set((appts ?? []).map((a: any) => a.physiotherapist_id))];
    if (!ids.length) {
      setContacts([]);
      return;
    }
    const { data: profs } = await supabase.from('profiles').select('id, first_name, last_name').in('id', ids);
    setContacts(
      (profs ?? []).map((p: any) => ({
        id: p.id,
        name: `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || tr('Physiotherapist', 'Physiotherapist'),
      }))
    );
  }, [role, profile?.id, language]);

  const loadMessages = useCallback(async (convId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('id, conversation_id, sender_id, content, created_at')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });
    setMessages((data as Msg[]) ?? []);
  }, []);

  useEffect(() => { loadConversations(); loadContacts(); }, [loadConversations, loadContacts]);

  // Open an existing conversation with the given participant, or create one.
  // Works for both roles: a patient starts a chat with a physiotherapist, and a
  // physiotherapist starts one with their patient (e.g. from the patient panel).
  const openOrCreateConversation = useCallback(async (otherProfileId: string) => {
    if (!profile?.id || !role) return;
    const existing = conversations.find(
      (c) => c.patient_id === otherProfileId || c.physiotherapist_id === otherProfileId
    );
    if (existing) {
      setActiveId(existing.id);
      setShowContacts(false);
      return;
    }
    const payload =
      role === 'patient'
        ? { patient_id: profile.id, physiotherapist_id: otherProfileId }
        : { patient_id: otherProfileId, physiotherapist_id: profile.id };
    const { data, error } = await supabase
      .from('conversations')
      .insert(payload)
      .select('id, patient_id, physiotherapist_id, last_message_at')
      .single();
    if (error) {
      toast({ title: tr('Could not start chat', 'Imeshindwa kuanzisha mazungumzo'), description: error.message, variant: 'destructive' });
      return;
    }
    await loadConversations();
    setActiveId(data.id);
    setShowContacts(false);
  }, [profile?.id, role, conversations, loadConversations, toast, language]);

  // `?with=<profileId>` deep link (used by the physio patient list and patient contacts).
  // Wait until conversations have loaded so we reuse an existing chat instead of
  // creating a duplicate.
  useEffect(() => {
    const withId = searchParams.get('with');
    if (!withId || !convsLoaded || activeId) return;
    openOrCreateConversation(withId);
  }, [searchParams, convsLoaded, activeId, openOrCreateConversation]);

  // Load messages for the active conversation and poll for new ones.
  useEffect(() => {
    if (!activeId) return;
    loadMessages(activeId);
    const interval = setInterval(() => loadMessages(activeId), 4000);
    return () => clearInterval(interval);
  }, [activeId, loadMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const content = text.trim();
    if (!content || !activeId || !profile?.id) return;
    setSending(true);
    setText('');
    const { error } = await supabase.from('messages').insert({
      conversation_id: activeId,
      sender_id: profile.id,
      content,
      type: 'text',
    });
    setSending(false);
    if (error) {
      toast({ title: tr('Failed to send', 'Imeshindwa kutuma'), description: error.message, variant: 'destructive' });
      setText(content);
      return;
    }
    await loadMessages(activeId);
    loadConversations();
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">{tr('Loading...', 'Inapakia...')}</div>;
  }
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const activeConv = conversations.find((c) => c.id === activeId) ?? null;
  const activeName = activeConv ? (names[otherId(activeConv)] ?? tr('User', 'Mtumiaji')) : '';

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      <Navigation />
      <div className="page-shell flex-1 min-h-0 flex flex-col py-4">
        <div className="mb-4 flex items-center gap-3 flex-shrink-0">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">{tr('Messages', 'Ujumbe')}</h1>
            <p className="text-sm text-muted-foreground">
              {role === 'patient'
                ? tr('Chat directly with your physiotherapist.', 'Wasiliana moja kwa moja na physiotherapist wako.')
                : tr('Respond to your patients.', 'Jibu wagonjwa wako.')}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Conversation list */}
          <Card className={`shadow-card lg:col-span-1 overflow-hidden flex flex-col min-h-0 ${activeId ? 'hidden lg:flex' : 'flex'}`}>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="font-semibold">{tr('Conversations', 'Mazungumzo')}</span>
              {role === 'patient' && (
                <Button size="sm" variant="outline" onClick={() => setShowContacts((s) => !s)}>
                  <Plus className="h-4 w-4 mr-1" />
                  {tr('New', 'Mpya')}
                </Button>
              )}
            </div>

            {showContacts && role === 'patient' && (
              <div className="border-b border-border bg-muted/30">
                {contacts.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">{tr('Book a session first to connect with a physiotherapist.', 'Weka kikao kwanza ili kuungana na physiotherapist.')}</p>
                ) : (
                  contacts.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => openOrCreateConversation(c.id)}
                      className="w-full text-left px-4 py-3 hover:bg-muted flex items-center gap-3 transition-colors"
                    >
                      <Avatar className="h-8 w-8"><AvatarFallback><User className="h-4 w-4" /></AvatarFallback></Avatar>
                      <span className="text-sm font-medium">{c.name}</span>
                    </button>
                  ))
                )}
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  {tr('No conversations yet.', 'Hakuna mazungumzo bado.')}
                </div>
              ) : (
                conversations.map((c) => {
                  const name = names[otherId(c)] ?? tr('User', 'Mtumiaji');
                  return (
                    <button
                      key={c.id}
                      onClick={() => setActiveId(c.id)}
                      className={`w-full text-left p-4 border-b border-border/60 flex items-center gap-3 transition-colors ${
                        activeId === c.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-muted/50'
                      }`}
                    >
                      <Avatar className="h-10 w-10"><AvatarFallback><User className="h-5 w-5" /></AvatarFallback></Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{name}</p>
                        <p className="text-xs text-muted-foreground">
                          {role === 'patient' ? tr('Physiotherapist', 'Physiotherapist') : tr('Patient', 'Mgonjwa')}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </Card>

          {/* Chat area */}
          <Card className={`shadow-card lg:col-span-2 flex flex-col overflow-hidden min-h-0 ${activeId ? 'flex' : 'hidden lg:flex'}`}>
            {activeConv ? (
              <>
                <div className="p-4 border-b border-border flex items-center gap-3">
                  <Button size="icon" variant="ghost" className="lg:hidden" onClick={() => setActiveId(null)}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Avatar className="h-9 w-9"><AvatarFallback><User className="h-5 w-5" /></AvatarFallback></Avatar>
                  <div>
                    <p className="font-semibold leading-tight">{activeName}</p>
                    <p className="text-xs text-muted-foreground">
                      {role === 'patient' ? tr('Your physiotherapist', 'Physiotherapist wako') : tr('Patient', 'Mgonjwa')}
                    </p>
                  </div>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                      {tr('No messages yet. Say hello!', 'Hakuna ujumbe bado. Salimia!')}
                    </div>
                  ) : (
                    messages.map((m) => {
                      const mine = m.sender_id === profile?.id;
                      return (
                        <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${mine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                            <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                            <span className={`block text-[10px] mt-1 ${mine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                              {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-3 border-t border-border flex items-center gap-2">
                  <Input
                    placeholder={tr('Type your message...', 'Andika ujumbe wako...')}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                  />
                  <Button onClick={send} disabled={sending || !text.trim()} className="bg-gradient-hero">
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                <MessageSquare className="h-12 w-12 mb-3 opacity-50" />
                <p className="font-medium">{tr('Select a conversation', 'Chagua mazungumzo')}</p>
                <p className="text-sm">
                  {role === 'patient'
                    ? tr('Or start a new one with your physiotherapist.', 'Au anzisha mpya na physiotherapist wako.')
                    : tr('Your patients will appear here once they message you.', 'Wagonjwa wako wataonekana hapa watakapokutumia ujumbe.')}
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
