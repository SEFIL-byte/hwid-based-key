import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  const { browser_id } = req.body;

  const { data: existing } = await supabase
    .from("keys")
    .select("*")
    .eq("browser_id", browser_id)
    .single();

  if (existing && existing.seconds_remaining > 0) {
    return res.json({ success: false });
  }

  const key = crypto.randomBytes(16).toString("hex");

  await supabase.from("keys").insert({
    key,
    browser_id,
    seconds_remaining: 86400,
    last_check: new Date()
  });

  res.json({ success: true, key });
}
