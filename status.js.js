import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function format(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h}h ${m}m`;
}

export default async function handler(req, res) {
  const { browser_id } = req.body;

  const { data } = await supabase
    .from("keys")
    .select("*")
    .eq("browser_id", browser_id)
    .single();

  if (!data || data.seconds_remaining <= 0) {
    return res.json({ active: false });
  }

  res.json({
    active: true,
    time: format(data.seconds_remaining)
  });
}
