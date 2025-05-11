
import { createClient } from '@supabase/supabase-js';
import { MarkerType } from '@xyflow/react';

// For development/testing when environment variables are not set
// In production, these should be set properly
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vpjwdvawiacjrbubquly.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwandkdmF3aWFjanJidWJxdWx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4NTMwMzAsImV4cCI6MjA2MjQyOTAzMH0.f4YEFuakiDEXIE4tKdwm_wHNmB5GgWZwopZwupoMlDc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for our OKR data structure
export interface OKRNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, any>;
  style?: Record<string, any>;
  parentId?: string;
  extent?: string | [number, number, number, number] | 'parent';
}

export interface OKREdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  style?: Record<string, any>;
  markerEnd?: { type: MarkerType } | string;
  sourceHandle?: string;
  label?: string | number;
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
