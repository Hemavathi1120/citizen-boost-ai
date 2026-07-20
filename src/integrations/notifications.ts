import { Buffer } from 'buffer';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const APP_URL = process.env.APP_URL || process.env.VITE_APP_URL || 'https://schemesync.ai';

type SchemeMatch = {
  slug: string;
  scheme: {
    name: string;
    category: string;
    short_description: string | null;
  };
};

type NotificationPayload = {
  user_id: string;
  title: string;
  message?: string | null;
  type?: string | null;
  action_url?: string | null;
};

function formatSchemeSummary(matches: SchemeMatch[]) {
  return matches
    .map((match) => `- ${match.scheme.name} (${match.scheme.category})`)
    .join('\n');
}

async function sendEmailNotification(to: string, subject: string, body: string) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM_EMAIL;
  const fromName = process.env.SENDGRID_FROM_NAME || 'SchemeSync AI';

  if (!apiKey || !from) {
    return;
  }

  await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: to }],
          subject,
        },
      ],
      from: { email: from, name: fromName },
      content: [{ type: 'text/plain', value: body }],
    }),
  });
}

async function sendSmsNotification(to: string, body: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_PHONE;

  if (!accountSid || !authToken || !from) {
    return;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/Messages.json`;
  const params = new URLSearchParams({
    From: from,
    To: to,
    Body: body,
  });

  await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
}

export async function notifyNewEligibleSchemes(
  supabase: SupabaseClient<Database>,
  userId: string,
  matches: SchemeMatch[],
) {
  if (matches.length === 0) return;

  const profileRes = await supabase.from('profiles').select('email, phone').eq('id', userId).maybeSingle();
  if (profileRes.error || !profileRes.data) {
    console.error('[notifications] Failed to load profile for user', userId, profileRes.error?.message);
    return;
  }

  const email = profileRes.data.email?.trim();
  const phone = profileRes.data.phone?.trim();

  const actionUrls = matches.map((match) => `/schemes/${match.slug}`);
  const existingRes = await supabase
    .from('notifications')
    .select('action_url')
    .eq('user_id', userId)
    .eq('type', 'scheme_match')
    .in('action_url', actionUrls);

  if (existingRes.error) {
    console.error('[notifications] Failed to query existing notifications', existingRes.error.message);
    return;
  }

  const existingUrls = new Set((existingRes.data ?? []).map((row) => row.action_url ?? ''));
  const newMatches = matches.filter((match) => !existingUrls.has(`/schemes/${match.slug}`));
  if (newMatches.length === 0) return;

  const notifications: NotificationPayload[] = newMatches.map((match) => ({
    user_id: userId,
    title: `Eligible scheme: ${match.scheme.name}`,
    message: `You qualify for ${match.scheme.name}.${match.scheme.short_description ? ` ${match.scheme.short_description}` : ''}`,
    type: 'scheme_match',
    action_url: `/schemes/${match.slug}`,
  }));

  const { error: insertError } = await supabase.from('notifications').insert(notifications);
  if (insertError) {
    console.error('[notifications] Failed to insert notifications', insertError.message);
  }

  const subject = 'New eligible government schemes available';
  const summary = formatSchemeSummary(newMatches);

  if (email) {
    try {
      await sendEmailNotification(
        email,
        subject,
        `Hello,

You have ${newMatches.length} new eligible scheme(s) on SchemeSync AI:

${summary}

Open your SchemeSync dashboard to view the details and apply: ${APP_URL}/_authenticated/notifications

Thank you,
SchemeSync AI`,
      );
    } catch (error) {
      console.error('[notifications] Email dispatch failed', error);
    }
  }

  if (phone) {
    try {
      await sendSmsNotification(
        phone,
        `SchemeSync AI: ${newMatches.length} new eligible scheme(s) are available. Log in to view them: ${APP_URL}/_authenticated/notifications`,
      );
    } catch (error) {
      console.error('[notifications] SMS dispatch failed', error);
    }
  }
}
