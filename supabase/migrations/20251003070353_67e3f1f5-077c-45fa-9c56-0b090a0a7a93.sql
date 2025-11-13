-- Create conversations table to track chats between patients and physiotherapists
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  physiotherapist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(patient_id, physiotherapist_id)
);

-- Create messages table for chat messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_message_type CHECK (type IN ('text', 'image', 'video', 'document'))
);

-- Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations"
  ON public.conversations FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.profiles 
      WHERE id = conversations.patient_id OR id = conversations.physiotherapist_id
    )
  );

CREATE POLICY "Patients can create conversations with physiotherapists"
  ON public.conversations FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.profiles 
      WHERE id = conversations.patient_id AND role = 'patient'
    )
  );

CREATE POLICY "Users can update their own conversations"
  ON public.conversations FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.profiles 
      WHERE id = conversations.patient_id OR id = conversations.physiotherapist_id
    )
  );

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE auth.uid() IN (
        SELECT user_id FROM public.profiles 
        WHERE id = conversations.patient_id OR id = conversations.physiotherapist_id
      )
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE auth.uid() IN (
        SELECT user_id FROM public.profiles 
        WHERE id = conversations.patient_id OR id = conversations.physiotherapist_id
      )
    )
    AND
    auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = sender_id)
  );

CREATE POLICY "Users can update their own messages"
  ON public.messages FOR UPDATE
  USING (
    auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = sender_id)
  );

-- Create indexes for better performance
CREATE INDEX idx_conversations_patient ON public.conversations(patient_id);
CREATE INDEX idx_conversations_physiotherapist ON public.conversations(physiotherapist_id);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

-- Create trigger to update conversation's updated_at and last_message_at
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations 
  SET updated_at = now(), last_message_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_conversation_on_new_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_timestamp();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;