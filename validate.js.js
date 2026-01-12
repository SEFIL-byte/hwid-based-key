import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  const { key, hwid } = req.body;

  const { data: system } = await supabase
    .from("system_state")
    .select("*")
    .single();

  const { data } = await supabase
    .from("keys")
    .select("*")
    .eq("key", key)
    .single();

  if (!data || data.revoked) {
    return res.json({ success: false });
  }

  if (!data.hwid) {
    await supabase.from("keys")
      .update({ hwid })
      .eq("key", key);
  } else if (data.hwid !== hwid) {
    return res.json({ success: false });
  }

  if (!system.is_paused) {
    const delta = (Date.now() - new Date(data.last_check)) / 1000;
    await supabase.from("keys").update({
      seconds_remaining: Math.max(0, data.seconds_remaining - delta),
      last_check: new Date()
    }).eq("key", key);
  }

  if (data.seconds_remaining <= 0) {
    return res.json({ success: false });
  }

  res.json({ success: true });
}
