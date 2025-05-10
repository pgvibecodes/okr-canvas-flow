
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface ObjectiveNodeContentProps {
  isEditing: boolean;
  description: string;
  setDescription: (description: string) => void;
  progress: number;
  department: string;
  setDepartment: (department: string) => void;
}

const departments = [
  "Engineering",
  "Marketing",
  "Sales",
  "Product",
  "Design",
  "HR",
  "Finance",
  "Operations"
];

const ObjectiveNodeContent: React.FC<ObjectiveNodeContentProps> = ({
  isEditing,
  description,
  setDescription,
  progress,
  department,
  setDepartment,
}) => {
  return (
    <>
      {isEditing ? (
        <>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description..."
            className="min-h-[60px] text-sm mb-2"
          />
          <div className="mb-2">
            <label className="text-xs text-gray-500 mb-1 block">Department</label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-2">{description}</p>
          {department && department !== "none" && (
            <div className="mb-2">
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                {department}
              </span>
            </div>
          )}
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </>
      )}
    </>
  );
};

export default ObjectiveNodeContent;
