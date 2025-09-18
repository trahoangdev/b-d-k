import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { FileActions } from "@/components/file-actions";
import { 
  FolderOpen, 
  File, 
  Search, 
  Filter,
  Grid3X3,
  List,
  Download,
  Share2,
  MoreHorizontal,
  Calendar,
  User,
  HardDrive
} from "lucide-react";

const Explorer = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const folders = [
    { name: "Documents", files: 1234, size: "1.2 TB", modified: "2 giờ trước", type: "folder" },
    { name: "Images", files: 5678, size: "850 GB", modified: "1 ngày trước", type: "folder" },
    { name: "Videos", files: 234, size: "500 GB", modified: "3 ngày trước", type: "folder" },
    { name: "Archives", files: 89, size: "120 GB", modified: "1 tuần trước", type: "folder" },
  ];

  const files = [
    { 
      name: "báo-cáo-quý-2024.pdf", 
      size: "24.5 MB", 
      modified: "1 giờ trước", 
      type: "pdf",
      owner: "Nguyễn Văn A"
    },
    { 
      name: "dữ-liệu-bán-hàng.csv", 
      size: "145 KB", 
      modified: "3 giờ trước", 
      type: "csv",
      owner: "Lê Thị B"
    },
    { 
      name: "thuyết-trình-cuối.pptx", 
      size: "12.8 MB", 
      modified: "5 giờ trước", 
      type: "pptx",
      owner: "Trần Văn C"
    },
    { 
      name: "database-backup.sql", 
      size: "890 MB", 
      modified: "1 ngày trước", 
      type: "sql",
      owner: "Phạm Thị D"
    },
  ];

  const getFileIcon = (type: string) => {
    return <File className="h-5 w-5 text-muted-foreground" />;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      pdf: "bg-red-500/10 text-red-500 border-red-500/20",
      csv: "bg-green-500/10 text-green-500 border-green-500/20",
      pptx: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      sql: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    };
    return colors[type] || "bg-muted/10 text-muted-foreground border-muted/20";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Kho dữ liệu</h1>
          <p className="text-muted-foreground mt-1">
            Duyệt và quản lý tất cả file và thư mục
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="hover-glow">
            <Filter className="h-4 w-4 mr-2" />
            Lọc
          </Button>
          <Button 
            variant={viewMode === "grid" ? "default" : "outline"}
            onClick={() => setViewMode("grid")}
            size="icon"
            className="hover-glow"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
            size="icon"
            className="hover-glow"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Breadcrumb */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Root</span>
          <span>/</span>
          <span className="text-foreground">Documents</span>
        </div>
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm kiếm file và thư mục..." 
              className="pl-10 hover-glow"
            />
          </div>
        </div>
      </div>

      {/* Folders */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Thư mục
        </h2>
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" : "space-y-2"}>
          {folders.map((folder, index) => (
            <Card key={index} className="card-modern hover-glow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="gradient-accent rounded-lg p-2">
                    <FolderOpen className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{folder.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>{folder.files} files</span>
                      <span>•</span>
                      <span>{folder.size}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{folder.modified}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Files */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <File className="h-5 w-5" />
          File
        </h2>
        
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {files.map((file, index) => (
              <Card key={index} className="card-modern hover-glow cursor-pointer group">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      {getFileIcon(file.type)}
                      <Badge variant="outline" className={getTypeColor(file.type)}>
                        {file.type.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm truncate" title={file.name}>
                        {file.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <HardDrive className="h-3 w-3" />
                        <span>{file.size}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <User className="h-3 w-3" />
                        <span>{file.owner}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>{file.modified}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Download className="h-3 w-3 mr-1" />
                        Tải
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Share2 className="h-3 w-3 mr-1" />
                        Chia sẻ
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="card-modern">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer group">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(file.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{file.name}</h3>
                          <Badge variant="outline" className={getTypeColor(file.type)}>
                            {file.type.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span>{file.size}</span>
                          <span>{file.owner}</span>
                          <span>{file.modified}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        Tải
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="h-3 w-3 mr-1" />
                        Chia sẻ
                      </Button>
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Explorer;