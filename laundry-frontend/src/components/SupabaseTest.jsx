import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function SupabaseTest() {
  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .limit(5);

      if (error) {
        console.error("❌ Supabase connection error:", error);
        return;
      }

      console.log("✅ Supabase connection successful!");
      console.log("Customer data:", data);
    }

    testConnection();
  }, []);

  return <div>Supabase connection test</div>;
}