import { createClient } from '@supabase/supabase-js';
import { MarkerType } from '@xyflow/react';

// For development/testing when environment variables are not set
// In production, these should be set properly
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vpjwdvawiacjrbubquly.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwandkdmF3aWFjanJidWJxdWx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4NTMwMzAsImV4cCI6MjA2MjQyOTAzMH0.f4YEFuakiDEXIE4tKdwm_wHNmB5GgWZwopZwupoMlDc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for our database tables
export interface OKRBoard {
  id?: number;
  user_id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Objective {
  id: string;
  board_id: number;
  user_id: string;
  parent_id?: string;
  label: string;
  description?: string;
  progress?: number;
  department?: string;
  position_x: number;
  position_y: number;
  style?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface KeyResult {
  id: string;
  objective_id: string;
  user_id: string;
  board_id: number; // Add board_id to reflect our database change
  label: string;
  description?: string;
  progress?: number;
  department?: string;
  position_x: number;
  position_y: number;
  style?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface OKREdge {
  id: string;
  source_id: string;
  target_id: string;
  board_id: number;
  user_id: string;
  type?: string;
  animated?: boolean;
  style?: Record<string, any>;
  label?: string;
  created_at?: string;
  updated_at?: string;
}

// For backward compatibility with existing code
export interface OKRNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, any>;
  style?: Record<string, any>;
  parentId?: string;
  extent?: string | [number, number, number, number] | 'parent';
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
