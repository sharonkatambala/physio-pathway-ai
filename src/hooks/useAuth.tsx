import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  email?: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url?: string | null;
  phone: string | null;
  age: number | null;
  sex: string | null;
  occupation: string | null;
}

interface UserRole {
  role: 'patient' | 'physiotherapist' | 'admin';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: 'patient' | 'physiotherapist' | 'admin' | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<'patient' | 'physiotherapist' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);

  const normalize = (value: unknown) =>
    typeof value === 'string' ? value.trim() : '';

  const isPlaceholderName = (value: string | null | undefined) => {
    const normalized = normalize(value).toLowerCase();
    return normalized === 'yourfirst' || normalized === 'yourlast';
  };

  const syncProfileFromMetadata = async (authUser: User) => {
    const meta = (authUser.user_metadata || {}) as Record<string, any>;
    const metaFirst = normalize(meta.first_name);
    const metaLast = normalize(meta.last_name);
    const metaRole = normalize(meta.role);
    const metaPhone = normalize(meta.phone);
    const metaSex = normalize(meta.sex);
    const metaOccupation = normalize(meta.occupation);
    const metaAvatarUrl = normalize(meta.avatar_url);
    const metaEmail = normalize(meta.email) || normalize(authUser.email);
    const metaAge = typeof meta.age === 'number' ? meta.age : Number(meta.age) || null;

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authUser.id)
      .single();

    const profilePayload: Partial<Profile> & { user_id: string } = {
      user_id: authUser.id,
      email: metaEmail || null,
      first_name: metaFirst || null,
      last_name: metaLast || null,
      phone: metaPhone || null,
      age: metaAge ?? null,
      sex: metaSex || null,
      occupation: metaOccupation || null,
      avatar_url: metaAvatarUrl || null,
    };

    if (!existingProfile) {
      if (metaFirst || metaLast || metaEmail) {
        const { data: inserted } = await supabase
          .from('profiles')
          .insert(profilePayload)
          .select()
          .single();
        if (inserted) setProfile(inserted as Profile);
      }
    } else {
      const updatePayload: Partial<Profile> = {};
      if ((!existingProfile.first_name || isPlaceholderName(existingProfile.first_name)) && metaFirst) {
        updatePayload.first_name = metaFirst;
      }
      if ((!existingProfile.last_name || isPlaceholderName(existingProfile.last_name)) && metaLast) {
        updatePayload.last_name = metaLast;
      }
      if (!existingProfile.email && metaEmail) updatePayload.email = metaEmail;
      if (!existingProfile.phone && metaPhone) updatePayload.phone = metaPhone;
      if (!existingProfile.age && metaAge !== null) updatePayload.age = metaAge;
      if (!existingProfile.sex && metaSex) updatePayload.sex = metaSex;
      if (!existingProfile.occupation && metaOccupation) updatePayload.occupation = metaOccupation;
      if (!existingProfile.avatar_url && metaAvatarUrl) updatePayload.avatar_url = metaAvatarUrl;

      if (Object.keys(updatePayload).length > 0) {
        const { data: updated } = await supabase
          .from('profiles')
          .update(updatePayload)
          .eq('id', existingProfile.id)
          .select()
          .single();
        if (updated) setProfile(updated as Profile);
      } else {
        setProfile(existingProfile as Profile);
      }
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', authUser.id)
      .single();

    if (roleData?.role) {
      setRole(roleData.role || null);
    } else if (metaRole === 'patient' || metaRole === 'physiotherapist' || metaRole === 'admin') {
      await supabase.from('user_roles').insert({ user_id: authUser.id, role: metaRole });
      setRole(metaRole as 'patient' | 'physiotherapist' | 'admin');
    } else {
      setRole(null);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(async () => {
            await syncProfileFromMetadata(session.user);
          }, 0);
        } else {
          setProfile(null);
          setRole(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, userData: any) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userData
      }
    });
    if (!error && data?.session?.user) {
      await syncProfileFromMetadata(data.session.user);
    }
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      role,
      loading,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
