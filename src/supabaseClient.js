import { createClient } from "@supabase/supabase-js";

// Hardcode dulu buat test
const supabaseUrl = "https://dgrncsnsgtrsotnynsrl.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRncm5jc25zZ3Ryc290bnluc3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2Mzg0ODEsImV4cCI6MjA3NzIxNDQ4MX0.H0viNk48Ia2q_GIy94706wM2OUyj6KBdxU_DcLEQE4I";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
