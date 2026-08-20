// Deploy with: supabase functions deploy send-chat-push
// Reuses the same VAPID secrets already set for send-order-push (no new
// secrets needed): VAPID_PRIVATE_KEY, VAPID_SUBJECT.
//
// Generic admin push: pushes a notification to every subscription saved in
// admin_push_subscriptions (the admin is the only subscriber, no per-order
// scoping). Called by two triggers in supabase/setup.sql —
// trg_notify_new_chat_message (passes {conversation_id, preview}) and
// trg_notify_admin_push_new_order (passes {title, body, url}). The name
// stuck from the first caller; despite the name it's shared by both.

import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2';

// Public key only — safe to hardcode, it's the same value shipped in script.js.
const VAPID_PUBLIC_KEY = 'BBNd3SdADUSjP5Y4gCBjiMJi7gfO0xulbR24YX5RBM_9bMvOYTubWDw2kddV2sny7wQE6zO2nAO8kEKcJOJ9jUQ';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') ?? '';
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@barmartiri.app';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  if (!VAPID_PRIVATE_KEY) {
    return new Response('VAPID_PRIVATE_KEY secret is not set', { status: 500 });
  }

  const { preview, title, body, url } = await req.json().catch(() => ({}));
  const notificationBody = body || preview;
  if (!notificationBody) {
    return new Response(JSON.stringify({ skipped: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: subscriptions, error } = await supabase
    .from('admin_push_subscriptions')
    .select('id,endpoint,p256dh,auth');

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const payload = JSON.stringify({
    title: title || 'Mesazh i ri',
    body: String(notificationBody).slice(0, 140),
    url: url || '/admin',
  });
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
    await supabase.from('admin_push_subscriptions').delete().in('id', expiredIds);
  }

  return new Response(JSON.stringify({ sent: (subscriptions ?? []).length - expiredIds.length }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
