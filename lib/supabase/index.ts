/**
 * Legacy supabase export for backward compatibility
 * This file re-exports createClient from @/lib/supabase/client/client
 * for client-side components that import { supabase } from "@/lib/supabase/client/client"
 */
import { createClient } from "./client";

export const supabase = createClient();
