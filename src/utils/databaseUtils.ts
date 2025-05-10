
// Utility functions to handle OKR data persistence
import { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';

// Type definitions for OKR data
export interface OKRData {
  nodes: Node[];
  edges: Edge[];
}

// Function to save OKR data to localStorage (substitute for database in this example)
export const saveOKRData = (nodes: Node[], edges: Edge[]): void => {
  try {
    const okrData: OKRData = {
      nodes,
      edges
    };
    localStorage.setItem('okr-data', JSON.stringify(okrData));
    console.log('OKR data saved successfully');
  } catch (error) {
    console.error('Failed to save OKR data:', error);
    toast.error('Failed to save your changes');
  }
};

// Function to load OKR data from localStorage
export const loadOKRData = (): OKRData | null => {
  try {
    const savedData = localStorage.getItem('okr-data');
    if (!savedData) return null;
    
    const okrData = JSON.parse(savedData) as OKRData;
    console.log('OKR data loaded successfully');
    return okrData;
  } catch (error) {
    console.error('Failed to load OKR data:', error);
    toast.error('Failed to load your data');
    return null;
  }
};

// Clear all stored OKR data
export const clearOKRData = (): void => {
  try {
    localStorage.removeItem('okr-data');
    console.log('OKR data cleared successfully');
  } catch (error) {
    console.error('Failed to clear OKR data:', error);
  }
};
