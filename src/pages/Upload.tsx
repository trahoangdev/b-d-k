import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload as UploadIcon,
  File,
  FolderPlus,
  X,
  Check,
  AlertCircle,
  Cloud,
  HardDrive,
  Zap,
  Loader2
} from "lucide-react";
import { fileApi, File as ApiFile } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

interface FileItem {
  name: string;
  size: string;
  progress: number;
  status: 'completed' | 'uploading' | 'error' | 'queued';
  speed: string;
}

const Upload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<ApiFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { isAuthenticated } = useAuth();

  const uploadMethods = [
    {
      title: "Kéo thả file",
      description: "Kéo file từ máy tính vào khu vực bên dưới",
      icon: UploadIcon,
      color: "text-primary"
    },
    {
      title: "Chọn file",
      description: "Duyệt và chọn file từ thiết bị của bạn",
      icon: FolderPlus,
      color: "text-info"
    },
    {
      title: "Từ Cloud",
      description: "Import từ Google Drive, Dropbox, OneDrive",
      icon: Cloud,
      color: "text-success"
    }
  ];

  const uploadQueue = [
    { 
      name: "document.pdf", 
      size: "24.5 MB", 
      progress: 100, 
      status: "completed",
      speed: "2.4 MB/s"
    },
    { 
      name: "spreadsheet.xlsx", 
      size: "8.2 MB", 
      progress: 75, 
      status: "uploading",
      speed: "1.8 MB/s"
    },
    { 
      name: "presentation.pptx", 
      size: "45.1 MB", 
      progress: 45, 
      status: "uploading",
      speed: "3.2 MB/s"
    },
    { 
      name: "archive.zip", 
      size: "156 MB", 
      progress: 0, 
      status: "queued",
      speed: ""
    }
  ];

  const recentUploads = [
    { name: "quarterly-report.pdf", size: "24.5 MB", time: "2 phút trước", folder: "Documents" },
    { name: "user-data.csv", size: "1.2 MB", time: "15 phút trước", folder: "Data" },
    { name: "backup-files.zip", size: "890 MB", time: "1 giờ trước", folder: "Archives" },
    { name: "presentation.pptx", size: "45.1 MB", time: "2 giờ trước", folder: "Documents" }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const newFiles: FileItem[] = droppedFiles.map(file => ({
        name: file.name,
        size: formatFileSize(file.size),
        progress: 0,
        status: 'queued' as const,
        speed: ''
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Load uploaded files on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadFiles();
    }
  }, [isAuthenticated]);

  const loadFiles = async () => {
    try {
      const response = await fileApi.getFiles();
      if (response.success && response.data) {
        setUploadedFiles(response.data.files);
      }
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  };

  const handleFileUpload = async (file: globalThis.File) => {
    if (!isAuthenticated) {
      setError('Vui lòng đăng nhập để upload file');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fileApi.uploadFile(file, (progress) => {
        // Update progress if needed
        console.log('Upload progress:', progress);
      });

      if (response.success && response.data) {
        setSuccess(`File "${file.name}" đã được upload thành công!`);
        await loadFiles(); // Reload files list
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="h-4 w-4 text-success" />;
      case "uploading":
        return <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <File className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-success/20 bg-success/5";
      case "uploading":
        return "border-primary/20 bg-primary/5";
      case "error":
        return "border-destructive/20 bg-destructive/5";
      default:
        return "border-muted/20 bg-muted/5";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tải lên</h1>
          <p className="text-muted-foreground mt-1">
            Tải lên và quản lý file mới vào hệ thống
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="hover-glow">
            <Cloud className="h-4 w-4 mr-2" />
            Kết nối Cloud
          </Button>
          <Button className="gradient-primary hover-glow">
            <Zap className="h-4 w-4 mr-2" />
            Upload nhanh
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <Check className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Upload Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {uploadMethods.map((method, index) => (
          <Card key={index} className="card-modern hover-glow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className={`inline-flex p-3 rounded-full bg-muted/50 mb-4 ${method.color}`}>
                <method.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">{method.title}</h3>
              <p className="text-sm text-muted-foreground">{method.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Upload Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drop Zone */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadIcon className="h-5 w-5" />
              Khu vực tải lên
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={async () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.jpg,.jpeg,.png,.gif';
                input.onchange = async (e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.files && target.files[0]) {
                    const selectedFiles = Array.from(target.files);
                    for (const file of selectedFiles) {
                      await handleFileUpload(file);
                    }
                  }
                };
                input.click();
              }}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="gradient-primary rounded-full p-4">
                  <UploadIcon className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Kéo thả file vào đây
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Hoặc nhấn để chọn file từ thiết bị
                  </p>
                  <Button 
                    className="gradient-primary"
                    disabled={uploading}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.multiple = true;
                      input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.jpg,.jpeg,.png,.gif';
                      input.onchange = async (e) => {
                        const target = e.target as HTMLInputElement;
                        if (target.files && target.files[0]) {
                          const selectedFiles = Array.from(target.files);
                          for (const file of selectedFiles) {
                            await handleFileUpload(file);
                          }
                        }
                      };
                      input.click();
                    }}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang upload...
                      </>
                    ) : (
                      'Chọn file'
                    )}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  Hỗ trợ: PDF, DOC, XLS, PPT, ZIP, IMG (Tối đa 2GB)
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="folder">Thư mục đích</Label>
                <Button variant="outline" size="sm">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Tạo mới
                </Button>
              </div>
              <Input 
                id="folder"
                placeholder="Chọn hoặc nhập tên thư mục..."
                defaultValue="/Documents/Projects"
                readOnly
              />
            </div>
          </CardContent>
        </Card>

        {/* Upload Queue */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Hàng đợi tải lên
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.length > 0 ? files.map((file, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getStatusColor(file.status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(file.status)}
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{file.size}</span>
                          {file.speed && (
                            <>
                              <span>•</span>
                              <span>{file.speed}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {file.status === "completed" ? "Hoàn thành" :
                         file.status === "uploading" ? "Đang tải" :
                         file.status === "error" ? "Lỗi" : "Chờ"}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setFiles(prev => prev.filter((_, i) => i !== index));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={file.progress} className="flex-1" />
                    <span className="text-xs text-muted-foreground w-12">
                      {file.progress}%
                    </span>
                  </div>
                </div>
              )) : uploadedFiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có file nào được upload</p>
                  <p className="text-sm">Kéo thả file hoặc nhấn "Chọn file" để bắt đầu</p>
                </div>
              ) : uploadedFiles.map((file, index) => (
                <div key={index} className="p-4 rounded-lg border border-success/20 bg-success/5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-success" />
                      <div>
                        <p className="font-medium text-sm">{file.original_name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatFileSize(parseInt(file.size))}</span>
                          <span>•</span>
                          <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-success border-success">
                        Hoàn thành
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={100} className="flex-1" />
                    <span className="text-xs text-muted-foreground w-12">
                      100%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Uploads */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <File className="h-5 w-5" />
            File đã tải lên gần đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {recentUploads.map((file, index) => (
              <div key={index} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <File className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{file.size}</span>
                      <span>•</span>
                      <span>{file.folder}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{file.time}</p>
                  <Badge variant="outline" className="mt-1">
                    Hoàn thành
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Upload;