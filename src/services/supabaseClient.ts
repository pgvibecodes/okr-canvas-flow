
import { createClient } from '@supabase/supabase-js';

// For development/testing when environment variables are not set
// In production, these should be set properly
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for our OKR data structure
export interface OKRNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, any>;
  style?: Record<string, any>;
  parentId?: string;
  extent?: string;
}

export interface OKREdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  style?: Record<string, any>;
  markerEnd?: Record<string, any>;
  sourceHandle?: string;
  label?: string;
}

export interface SavedOKRData {
  id?: number;
  user_id: string;
  name?: string;
  nodes: OKRNode[];
  edges: OKREdge[];
  created_at?: string;
  updated_at?: string;
}
