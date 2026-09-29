import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(url!, key!);

async function run() {
  console.log("Calling create_bucket_list...");
  const { data, error } = await supabase.rpc("create_bucket_list", { submitted_items: ["dream 1", "dream 2"] });
  console.log("Data:", data);
  console.log("Error:", error);
}

run();
