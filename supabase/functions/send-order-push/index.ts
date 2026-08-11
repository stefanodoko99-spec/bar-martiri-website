// Deploy with: supabase functions deploy send-order-push
// Secrets required (set once): supabase secrets set VAPID_PRIVATE_KEY=... VAPID_SUBJECT=mailto:you@yourdomain
//
// Called by the trg_notify_customer_order_status trigger in supabase/setup.sql
// whenever an order's status changes. Looks up every push subscription saved
// for that order and sends each one a Web Push notification.

import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2';

// Public key only — safe to hardcode, it's the same value shipped in script.js.
const VAPID_PUBLIC_KEY = 'BBNd3SdADUSjP5Y4gCBjiMJi7gfO0xulbR24YX5RBM_9bMvOYTubWDw2kddV2sny7wQE6zO2nAO8kEKcJOJ9jUQ';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') ?? '';
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@barmartiri.app';

const STATUS_TEXT: Record<string, { title: string; body: string }> = {
  confirmed: { title: 'Porosia u konfirmua!', body: 'Do të vijë shpejt te ti.' },
  cancelled: { title: 'Porosia u anulua.', body: 'Na vjen keq. Provo përsëri ose na kontakto.' },
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  if (!VAPID_PRIVATE_KEY) {
    return new Response('VAPID_PRIVATE_KEY secret is not set', { status: 500 });
  }

  const { order_id: orderId, status } = await req.json().catch(() => ({}));
  const message = STATUS_TEXT[status];
  if (!orderId || !message) {
    return new Response(JSON.stringify({ skipped: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('id,endpoint,p256dh,auth')
    .eq('order_id', orderId);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const payload = JSON.stringify({ title: message.title, body: message.body, url: '/' });
  const expiredIds: string[] = [];

  await Promise.all(
    (subscriptions ?? []).map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          payload
        );
      } catch (sendError) {
        const statusCode = (sendError as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) expiredIds.push(subscription.id);
      }
    })
  );

  if (expiredIds.length) {
    await supabase.from('push_subscriptions').delete().in('id', expiredIds);
  }

  return new Response(JSON.stringify({ sent: (subscriptions ?? []).length - expiredIds.length }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
