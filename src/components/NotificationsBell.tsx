import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';

type Notification = {
  id: string;
  type: string;
  data: Record<string, unknown> | null;
  link: string | null;
  created_at: string;
  read_at: string | null;
};

const MAX_SHOWN = 15;

const NotificationsBell = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const tr = (en: string, sw: string) => (language === 'sw' ? sw : en);
  const navigate = useNavigate();

  const [items, setItems] = useState<Notification[]>([]);
  const unread = items.filter((n) => !n.read_at).length;

  const load = useCallback(async () => {
    if (!user) return;
    const { data, error } = await (supabase.from('notifications' as any) as any)
      .select('id, type, data, link, created_at, read_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(MAX_SHOWN);
    // Table may not exist until the migration is applied - fail silently.
    if (!error && Array.isArray(data)) setItems(data as Notification[]);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    load();
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const n = payload.new as Notification;
          setItems((prev) => (prev.some((p) => p.id === n.id) ? prev : [n, ...prev].slice(0, MAX_SHOWN)));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, load]);

  const markAllRead = useCallback(async () => {
    if (!user || unread === 0) return;
    const now = new Date().toISOString();
    setItems((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: now })));
    await (supabase.from('notifications' as any) as any)
      .update({ read_at: now })
      .eq('user_id', user.id)
      .is('read_at', null);
  }, [user, unread]);

  if (!user) return null;

  const title = (n: Notification): string => {
    switch (n.type) {
      case 'booking_request': return tr('New session request', 'Ombi jipya la kikao');
      case 'booking_confirmed': return tr('Session confirmed', 'Kikao kimethibitishwa');
      case 'booking_cancelled': return tr('Session cancelled', 'Kikao kimeghairiwa');
      case 'booking_completed': return tr('Session marked completed', 'Kikao kimekamilika');
      case 'message': return tr('New message', 'Ujumbe mpya');
      default: return tr('Notification', 'Taarifa');
    }
  };

  const detail = (n: Notification): string | null => {
    const d = n.data ?? {};
    const date = typeof d.date === 'string' ? d.date : null;
    const time = typeof d.time === 'string' ? String(d.time).slice(0, 5) : null;
    const patient = typeof d.patient === 'string' && d.patient ? d.patient : null;
    const preview = typeof d.preview === 'string' ? d.preview : null;
    if (n.type === 'message') return preview;
    const when = [date, time].filter(Boolean).join(', ');
    if (n.type === 'booking_request') return [patient, when].filter(Boolean).join(' - ') || null;
    return when || null;
  };

  const timeAgo = (iso: string): string => {
    const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
    if (mins < 1) return tr('now', 'sasa hivi');
    if (mins < 60) return tr(`${mins}m ago`, `dakika ${mins} zilizopita`);
    const hours = Math.floor(mins / 60);
    if (hours < 24) return tr(`${hours}h ago`, `saa ${hours} zilizopita`);
    const days = Math.floor(hours / 24);
    return tr(`${days}d ago`, `siku ${days} zilizopita`);
  };

  return (
    <DropdownMenu onOpenChange={(open) => { if (open) markAllRead(); }}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={tr('Notifications', 'Taarifa')}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-muted/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>{tr('Notifications', 'Taarifa')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            {tr('Nothing yet. Booking and message updates will appear here.', 'Hakuna kitu bado. Taarifa za vikao na jumbe zitaonekana hapa.')}
          </p>
        ) : (
          items.map((n) => (
            <DropdownMenuItem
              key={n.id}
              className="flex cursor-pointer flex-col items-start gap-0.5 py-2.5"
              onClick={() => { if (n.link) navigate(n.link); }}
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span className={`text-sm ${n.read_at ? 'font-normal text-foreground/80' : 'font-semibold text-foreground'}`}>
                  {title(n)}
                </span>
                <span className="flex-shrink-0 text-[11px] text-muted-foreground">{timeAgo(n.created_at)}</span>
              </span>
              {detail(n) && (
                <span className="line-clamp-2 text-xs text-muted-foreground">{detail(n)}</span>
              )}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsBell;
