
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

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
