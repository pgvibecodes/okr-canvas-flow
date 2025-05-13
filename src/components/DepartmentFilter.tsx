
import React, { useState, useEffect } from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface DepartmentFilterProps {
  nodes: any[];
  onFilterChange: (department: string | null) => void;
  currentFilter: string | null;
}

const DepartmentFilter: React.FC<DepartmentFilterProps> = ({ 
  nodes, 
  onFilterChange, 
  currentFilter 
}) => {
  const [departments, setDepartments] = useState<string[]>([]);

  // Extract unique departments from nodes
  useEffect(() => {
    const uniqueDepartments = Array.from(new Set(
      nodes
        .filter(node => node.data?.department)
        .map(node => node.data.department)
    )).sort() as string[];
    
    setDepartments(uniqueDepartments);
  }, [nodes]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          size="sm"
        >
          <Filter className="h-4 w-4" />
          {currentFilter ? (
            <span>Department: {currentFilter}</span>
          ) : (
            <span>Filter by Department</span>
          )}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Departments</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => onFilterChange(null)} 
          className={!currentFilter ? 'font-medium' : ''}
        >
          Show All
        </DropdownMenuItem>
        
        {departments.length > 0 ? (
          departments.map((dept) => (
            <DropdownMenuItem 
              key={dept} 
              onClick={() => onFilterChange(dept)}
              className={currentFilter === dept ? 'font-medium' : ''}
            >
              {dept}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>No departments available</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DepartmentFilter;
