/**
 * Legacy supabase export for backward compatibility
 * This file re-exports createClient from @/lib/supabase/client
 * for client-side components that import { supabase } from "@/lib/supabase/client"
 */
import { createClient } from "./client";

export const supabase = createClient();
