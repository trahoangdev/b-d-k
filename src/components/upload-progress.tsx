import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, AlertCircle, CheckCircle2 } from "lucide-react";

interface UploadProgressProps {
  file: {
    name: string;
    size: string;
    progress: number;
    status: "uploading" | "completed" | "error" | "queued";
    speed?: string;
  };
  onCancel?: () => void;
}

export function UploadProgress({ file, onCancel }: UploadProgressProps) {
  const getStatusColor = () => {
    switch (file.status) {
      case "completed":
        return "bg-success text-success-foreground border-success/20";
      case "error":
        return "bg-destructive text-destructive-foreground border-destructive/20";
      case "uploading":
        return "bg-info text-info-foreground border-info/20";
      default:
        return "bg-muted text-muted-foreground border-muted/20";
    }
  };

  const getStatusText = () => {
    switch (file.status) {
      case "completed":
        return "Hoàn thành";
      case "error":
        return "Lỗi";
      case "uploading":
        return "Đang tải";
      default:
        return "Chờ";
    }
  };

  const getStatusIcon = () => {
    switch (file.status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4" />;
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" title={file.name}>
              {file.name}
            </p>
            <p className="text-xs text-muted-foreground">{file.size}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getStatusColor()}>
              {getStatusIcon()}
              <span className="ml-1">{getStatusText()}</span>
            </Badge>
            {onCancel && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onCancel}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Progress value={file.progress} className="flex-1" />
        <span className="text-xs text-muted-foreground w-12">
          {file.progress}%
        </span>
      </div>
      {file.speed && (
        <p className="text-xs text-muted-foreground">
          Tốc độ: {file.speed}
        </p>
      )}
    </div>
  );
}