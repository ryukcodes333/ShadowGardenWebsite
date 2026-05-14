import { createClient } from "@supabase/supabase-js";
import { logger } from "./logger.js";

const supabaseUrl = process.env["SUPABASE_URL"];
const supabaseServiceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

if (!supabaseUrl) throw new Error("SUPABASE_URL is required");
if (!supabaseServiceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function checkConnection(): Promise<void> {
  try {
    const { error } = await supabase.from("sg_users").select("id").limit(1);
    if (error && error.code !== "PGRST116" && error.code !== "42P01") {
      logger.warn({ error: error.message }, "Supabase connection warning");
    } else {
      logger.info("Supabase connected");
    }
  } catch (err) {
    logger.warn({ err }, "Supabase connection check failed");
  }
}
