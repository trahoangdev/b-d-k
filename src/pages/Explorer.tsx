import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { fileApi, File as ApiFile } from "@/services/api";
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
  HardDrive,
  Plus,
  Upload,
  Trash2,
  Edit,
  Eye,
  AlertCircle,
  Loader2,
  FolderPlus,
  RefreshCw,
  CheckCircle
} from "lucide-react";

const Explorer = () => {
  const { isAuthenticated } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [files, setFiles] = useState<ApiFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<ApiFile | null>(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadFiles();
    }
  }, [isAuthenticated]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const response = await fileApi.getFiles();
      if (response.success && response.data) {
        setFiles(response.data.files);
      }
    } catch (error) {
      setError('Không thể tải danh sách file');
      console.error('Load files error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  const handleDownload = async (file: ApiFile) => {
    try {
      await fileApi.downloadFile(file.id);
    } catch (error) {
      setError('Không thể tải file');
    }
  };

  const handleDelete = async (file: ApiFile) => {
    if (window.confirm(`Bạn có chắc muốn xóa file "${file.original_name}"?`)) {
      try {
        await fileApi.deleteFile(file.id);
        await loadFiles();
      } catch (error) {
        setError('Không thể xóa file');
      }
    }
  };

  const filteredFiles = files.filter(file =>
    file.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.mime_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return <File className="h-5 w-5 text-red-500" />;
    if (mimeType.includes('image')) return <File className="h-5 w-5 text-blue-500" />;
    if (mimeType.includes('video')) return <File className="h-5 w-5 text-purple-500" />;
    if (mimeType.includes('text')) return <File className="h-5 w-5 text-green-500" />;
    return <File className="h-5 w-5 text-muted-foreground" />;
  };

  const getTypeColor = (mimeType: string) => {
    if (mimeType.includes('pdf')) return "bg-red-500/10 text-red-500 border-red-500/20";
    if (mimeType.includes('image')) return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    if (mimeType.includes('video')) return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    if (mimeType.includes('text')) return "bg-green-500/10 text-green-500 border-green-500/20";
    return "bg-muted/10 text-muted-foreground border-muted/20";
  };

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || 'FILE';
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

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
          <Button variant="outline" className="hover-glow" onClick={loadFiles}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
            <DialogTrigger asChild>
              <Button variant="outline" className="hover-glow">
                <FolderPlus className="h-4 w-4 mr-2" />
                Tạo thư mục
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo thư mục mới</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="folderName">Tên thư mục</Label>
                  <Input
                    id="folderName"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Nhập tên thư mục..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateFolder(false)}>
                    Hủy
                  </Button>
                  <Button onClick={async () => {
                    if (!newFolderName.trim()) {
                      setError('Vui lòng nhập tên thư mục');
                      return;
                    }
                    
                    // TODO: Implement create folder API
                    // await folderApi.createFolder(newFolderName);
                    
                    // Mock success for now
                    setSuccess(`Thư mục "${newFolderName}" đã được tạo thành công!`);
                    setShowCreateFolder(false);
                    setNewFolderName('');
                    await loadFiles();
                  }}>
                    Tạo
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Files */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <File className="h-5 w-5" />
          File ({filteredFiles.length})
        </h2>
        
        {filteredFiles.length === 0 ? (
          <Card className="card-modern">
            <CardContent className="p-8 text-center">
              <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Không có file nào</p>
              <p className="text-sm text-muted-foreground">Tải lên file đầu tiên để bắt đầu</p>
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFiles.map((file, index) => (
              <Card key={index} className="card-modern hover-glow cursor-pointer group">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      {getFileIcon(file.mime_type)}
                      <Badge variant="outline" className={getTypeColor(file.mime_type)}>
                        {getFileExtension(file.original_name)}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm truncate" title={file.original_name}>
                        {file.original_name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <HardDrive className="h-3 w-3" />
                        <span>{formatFileSize(parseInt(file.size))}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(file.uploaded_at)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleDownload(file)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Tải
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setSelectedFile(file)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Xem
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
                {filteredFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer group">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(file.mime_type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{file.original_name}</h3>
                          <Badge variant="outline" className={getTypeColor(file.mime_type)}>
                            {getFileExtension(file.original_name)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span>{formatFileSize(parseInt(file.size))}</span>
                          <span>{file.mime_type}</span>
                          <span>{formatDate(file.uploaded_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownload(file)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Tải
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedFile(file)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Xem
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDelete(file)}
                      >
                        <Trash2 className="h-3 w-3" />
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