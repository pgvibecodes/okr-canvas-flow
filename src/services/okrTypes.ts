
import { Node, Edge } from '@xyflow/react';

// Type definitions for OKR data
export interface OKRData {
  nodes: Node[];
  edges: Edge[];
}

// Re-export relevant types from supabaseClient for convenience
export type {
  OKRBoard,
  Objective,
  KeyResult,
  OKREdge,
  OKRNode,
  SavedOKRData
} from '../services/supabaseClient';
