
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface KeyResultNodeContentProps {
  isEditing: boolean;
  description: string;
  setDescription: (value: string) => void;
  progress: number;
  setProgress: (value: number) => void;
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

const KeyResultNodeContent: React.FC<KeyResultNodeContentProps> = ({
  isEditing,
  description,
  setDescription,
  progress,
  setProgress,
  department,
  setDepartment
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
                <SelectItem value="">None</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Slider
              value={[progress]}
              min={0}
              max={100}
              step={5}
              onValueChange={(value) => setProgress(value[0])}
            />
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-2">{description}</p>
          {department && (
            <div className="mb-2">
              <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-800">
                {department}
              </span>
            </div>
          )}
          <div className="space-y-1">
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

export default KeyResultNodeContent;
