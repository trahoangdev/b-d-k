import { FileActionMenu } from "./file-action-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useState } from "react";
import { toast } from "./ui/use-toast";

interface FileActionsProps {
  file: {
    name: string;
    type: string;
  };
  onRename: (newName: string) => void;
  onDelete: () => void;
  onMove: (destination: string) => void;
}

export function FileActions({ file, onRename, onDelete, onMove }: FileActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    onDelete();
    setShowDeleteDialog(false);
    toast({
      title: "File đã được xóa",
      description: `${file.name} đã bị xóa khỏi hệ thống.`
    });
  };

  return (
    <>
      <FileActionMenu
        file={file}
        onRename={onRename}
        onDeleteClick={() => setShowDeleteDialog(true)}
        onMove={onMove}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. File này sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}