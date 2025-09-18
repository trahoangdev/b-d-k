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
  Loader2,
  Download,
  Trash2
} from "lucide-react";
import { fileApi, File as ApiFile } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const UploadNew = () => {
  const [dragActive, setDragActive] = useState(false);
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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      for (const file of droppedFiles) {
        await handleFileUpload(file);
      }
    }
  };

  const handleFileSelect = async () => {
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
  };

  const handleDownload = async (file: ApiFile) => {
    try {
      await fileApi.downloadFile(file.id);
    } catch (error) {
      setError('Không thể tải file');
    }
  };

  const handleDelete = async (file: ApiFile) => {
    try {
      await fileApi.deleteFile(file.id);
      await loadFiles();
      setSuccess(`File "${file.original_name}" đã được xóa!`);
    } catch (error) {
      setError('Không thể xóa file');
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
          <Button 
            variant="outline" 
            className="hover-glow"
            onClick={() => {
              // TODO: Implement cloud integration
              setError('Tính năng kết nối Cloud đang được phát triển');
            }}
          >
            <Cloud className="h-4 w-4 mr-2" />
            Kết nối Cloud
          </Button>
          <Button 
            className="gradient-primary hover-glow"
            onClick={() => {
              // Trigger file input for quick upload
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
              onClick={handleFileSelect}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFileSelect();
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

        {/* Uploaded Files */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Files đã upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedFiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có file nào được upload</p>
                  <p className="text-sm">Kéo thả file hoặc nhấn "Chọn file" để bắt đầu</p>
                </div>
              ) : (
                uploadedFiles.map((file, index) => (
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
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDownload(file)}
                          title="Tải xuống"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(file)}
                          title="Xóa file"
                        >
                          <Trash2 className="h-4 w-4" />
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
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadNew;
