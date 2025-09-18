import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UploadIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  onFilesDrop: (files: File[]) => void;
  maxSize?: number; // in bytes
  accept?: Record<string, string[]>;
  className?: string;
}

export function DropZone({ onFilesDrop, maxSize = 1024 * 1024 * 1024 * 2, accept, className }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesDrop(acceptedFiles);
  }, [onFilesDrop]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    maxSize,
    accept,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    onDropRejected: () => setIsDragging(false),
  });

  return (
    <Card
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed relative cursor-pointer transition-colors",
        isDragging || isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20",
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
          <UploadIcon className="w-6 h-6 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">
            {isDragging ? "Thả file tại đây" : "Kéo và thả file"}
          </h3>
          <p className="text-sm text-muted-foreground">
            hoặc nhấn để chọn file từ thiết bị
          </p>
          <Button variant="outline" className="relative z-10">
            Chọn file
          </Button>
          <p className="text-xs text-muted-foreground">
            Tối đa {Math.round(maxSize / 1024 / 1024)}MB
          </p>
        </div>
        {fileRejections.length > 0 && (
          <div className="mt-4 text-sm text-destructive">
            {fileRejections.map(({ file, errors }) => (
              <p key={file.name}>
                {file.name}: {errors[0].message}
              </p>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}