import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "./ui/context-menu";
import { 
  Pencil,
  Trash2,
  FolderInput,
  Copy,
  Share2,
  Download,
  MoreHorizontal 
} from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";
import { ShareDialog } from "./share-dialog";

interface FileActionMenuProps {
  file: {
    name: string;
    type: string;
  };
  onRename: (newName: string) => void;
  onDeleteClick: () => void;
  onMove: (destination: string) => void;
}

export function FileActionMenu({ file, onRename, onDeleteClick, onMove }: FileActionMenuProps) {
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const [destination, setDestination] = useState("");

  const handleRename = () => {
    onRename(newName);
    setShowRenameDialog(false);
  };

  const handleMove = () => {
    onMove(destination);
    setShowMoveDialog(false);
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuItem onClick={() => setShowRenameDialog(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Đổi tên
          </ContextMenuItem>
          
          <ContextMenuItem>
            <Copy className="mr-2 h-4 w-4" />
            Tạo bản sao
          </ContextMenuItem>

          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <FolderInput className="mr-2 h-4 w-4" />
              Di chuyển đến
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem onClick={() => setShowMoveDialog(true)}>
                Chọn thư mục...
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem>Documents</ContextMenuItem>
              <ContextMenuItem>Images</ContextMenuItem>
              <ContextMenuItem>Videos</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>

          <ContextMenuItem onClick={() => setShowShareDialog(true)}>
            <Share2 className="mr-2 h-4 w-4" />
            Chia sẻ
          </ContextMenuItem>

          <ContextMenuItem>
            <Download className="mr-2 h-4 w-4" />
            Tải xuống
          </ContextMenuItem>

          <ContextMenuSeparator />
          
          <ContextMenuItem onClick={onDeleteClick} className="text-destructive focus:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        item={file}
      />

      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đổi tên file</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên mới</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleRename}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Di chuyển file</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="destination">Chọn thư mục đích</Label>
              <Input
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="/Documents/Projects"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoveDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleMove}>Di chuyển</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}