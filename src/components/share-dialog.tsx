import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Globe, Lock, Users, Link, Copy, Calendar } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: {
    name: string;
    type: string;
  };
}

export function ShareDialog({ open, onOpenChange, item }: ShareDialogProps) {
  const [accessLevel, setAccessLevel] = useState("view");
  const [shareLink, setShareLink] = useState("");
  const [allowPublic, setAllowPublic] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");

  const handleShare = () => {
    // Giả lập tạo link chia sẻ
    const link = `https://yourapp.com/share/${Math.random().toString(36).substring(7)}`;
    setShareLink(link);
    toast({
      title: "Đã tạo link chia sẻ",
      description: "Link đã được tạo và sẵn sàng để chia sẻ"
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    toast({
      title: "Đã sao chép",
      description: "Link đã được sao chép vào clipboard"
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chia sẻ {item.type === "folder" ? "thư mục" : "file"}</DialogTitle>
          <DialogDescription>
            Thiết lập quyền truy cập và chia sẻ {item.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Cấp độ truy cập */}
          <div className="space-y-2">
            <Label>Cấp độ truy cập</Label>
            <Select value={accessLevel} onValueChange={setAccessLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Chỉ xem
                  </div>
                </SelectItem>
                <SelectItem value="comment">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Xem và bình luận
                  </div>
                </SelectItem>
                <SelectItem value="edit">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Chỉnh sửa
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Link chia sẻ */}
          {shareLink && (
            <div className="space-y-2">
              <Label>Link chia sẻ</Label>
              <div className="flex gap-2">
                <Input value={shareLink} readOnly />
                <Button size="icon" variant="outline" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Cài đặt nâng cao */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Cho phép truy cập công khai</Label>
                <p className="text-sm text-muted-foreground">
                  Bất kỳ ai có link đều có thể truy cập
                </p>
              </div>
              <Switch
                checked={allowPublic}
                onCheckedChange={setAllowPublic}
              />
            </div>

            <div className="space-y-2">
              <Label>Ngày hết hạn</Label>
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter className="flex space-x-2 sm:justify-between">
          {!shareLink && (
            <Button
              type="submit"
              className="flex-1"
              onClick={handleShare}
            >
              <Link className="mr-2 h-4 w-4" />
              Tạo link chia sẻ
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}