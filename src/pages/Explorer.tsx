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
import { fileApi, folderApi, File as ApiFile, Folder } from "@/services/api";
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
  CheckCircle,
  ArrowLeft
} from "lucide-react";

const Explorer = () => {
  const { isAuthenticated } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [files, setFiles] = useState<ApiFile[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<ApiFile | null>(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<Array<{id: string, name: string}>>([]);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async (folderId: string | null = null) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Load both files and folders for current folder
      const [filesResponse, foldersResponse] = await Promise.all([
        fileApi.getFiles(folderId ? { folderId } : {}),
        folderApi.getFolders()
      ]);
      
      if (filesResponse.success && filesResponse.data) {
        setFiles(filesResponse.data.files);
      }
      
      if (foldersResponse.success && foldersResponse.data) {
        // Filter folders by parent folder
        const filteredFolders = folderId 
          ? foldersResponse.data.folders.filter(f => f.parentId === folderId)
          : foldersResponse.data.folders.filter(f => !f.parentId);
        setFolders(filteredFolders);
      }
    } catch (error) {
      setError('Không thể tải dữ liệu');
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFiles = loadData; // Keep for backward compatibility

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
    if (window.confirm(`Bạn có chắc muốn xóa file "${file.originalName}"?`)) {
      try {
        await fileApi.deleteFile(file.id);
        await loadData();
      } catch (error) {
        setError('Không thể xóa file');
      }
    }
  };

  const handleDeleteFolder = async (folder: Folder) => {
    if (window.confirm(`Bạn có chắc muốn xóa thư mục "${folder.name}"?`)) {
      try {
        const response = await folderApi.deleteFolder(folder.id);
        if (response.success) {
          setSuccess(`Thư mục "${folder.name}" đã được xóa thành công!`);
          await loadData(currentFolderId);
        } else {
          setError(response.message || 'Không thể xóa thư mục');
        }
      } catch (error) {
        setError('Không thể xóa thư mục');
      }
    }
  };

  const handleOpenFolder = (folder: Folder) => {
    setCurrentFolderId(folder.id);
    setBreadcrumb(prev => [...prev, { id: folder.id, name: folder.name }]);
    loadData(folder.id);
  };

  const handleNavigateToFolder = (folderId: string | null) => {
    setCurrentFolderId(folderId);
    if (folderId) {
      // Find folder in breadcrumb and update
      const folderIndex = breadcrumb.findIndex(f => f.id === folderId);
      if (folderIndex !== -1) {
        setBreadcrumb(breadcrumb.slice(0, folderIndex + 1));
      }
    } else {
      setBreadcrumb([]);
    }
    loadData(folderId);
  };

  const handleMoveFileToFolder = async (file: ApiFile, folderId: string) => {
    try {
      const response = await fileApi.moveFile(file.id, folderId);
      if (response.success) {
        setSuccess(`File "${file.originalName}" đã được di chuyển vào thư mục`);
        await loadData(currentFolderId);
      } else {
        setError(response.message || 'Không thể di chuyển file');
      }
    } catch (error) {
      setError('Không thể di chuyển file');
    }
  };

  const handleDragStart = (e: React.DragEvent, file: ApiFile) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'file', data: file }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverFolder(folderId);
  };

  const handleDragLeave = () => {
    setDragOverFolder(null);
  };

  const handleDrop = async (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    setDragOverFolder(null);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.type === 'file') {
        await handleMoveFileToFolder(data.data, folderId);
      }
    } catch (error) {
      console.error('Drop error:', error);
    }
  };

  const handleSelectFile = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map(f => f.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedFiles.size === 0) return;
    
    try {
      const deletePromises = Array.from(selectedFiles).map(fileId => 
        fileApi.deleteFile(fileId)
      );
      
      const results = await Promise.all(deletePromises);
      const successCount = results.filter(r => r.success).length;
      
      if (successCount > 0) {
        setSuccess(`${successCount} file(s) đã được xóa thành công!`);
        setSelectedFiles(new Set());
        setShowDeleteDialog(false);
        await loadData(currentFolderId);
      } else {
        setError('Không thể xóa file');
      }
    } catch (error) {
      setError('Không thể xóa file');
    }
  };

  const filteredFiles = files.filter(file =>
    (file.originalName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (file.mimeType?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const filteredFolders = folders.filter(folder =>
    (folder.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (folder.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
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
          <Button variant="outline" className="hover-glow" onClick={() => loadData(currentFolderId)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          {selectedFiles.size > 0 && (
            <Button 
              variant="destructive" 
              className="hover-glow"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa ({selectedFiles.size})
            </Button>
          )}
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
                    
                    try {
                      setError('');
                      const response = await folderApi.createFolder(newFolderName.trim(), undefined, currentFolderId || undefined);
                      if (response.success) {
                        setSuccess(`Thư mục "${newFolderName}" đã được tạo thành công!`);
                        setShowCreateFolder(false);
                        setNewFolderName('');
                        await loadData(currentFolderId);
                      } else {
                        setError(response.message || 'Không thể tạo thư mục');
                      }
                    } catch (error) {
                      setError('Không thể tạo thư mục');
                    }
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
          {breadcrumb.length > 0 && (
            <button 
              onClick={() => handleNavigateToFolder(null)}
              className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-muted transition-colors"
              title="Trở về Root"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Root</span>
            </button>
          )}
          {breadcrumb.length === 0 && (
            <span className="px-2 py-1 rounded-md bg-muted/50">
              Root
            </span>
          )}
          {breadcrumb.map((folder, index) => (
            <div key={folder.id} className="flex items-center gap-2">
              <span>/</span>
              {index === breadcrumb.length - 1 ? (
                <span className="px-2 py-1 rounded-md bg-muted/50">
                  {folder.name}
                </span>
              ) : (
                <button 
                  onClick={() => handleNavigateToFolder(folder.id)}
                  className="px-2 py-1 rounded-md hover:bg-muted transition-colors"
                >
                  {folder.name}
                </button>
              )}
            </div>
          ))}
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

      {/* Drag & Drop Overlay */}
      {dragOverFolder && (
        <div className="fixed inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
            <p className="text-blue-600 dark:text-blue-400 font-medium">
              Thả file vào thư mục để di chuyển
            </p>
          </div>
        </div>
      )}

      {/* Folders */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Thư mục ({filteredFolders.length})
        </h2>
        
        {filteredFolders.length === 0 ? (
          <Card className="card-modern">
            <CardContent className="p-8 text-center">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Không có thư mục nào</p>
              <p className="text-sm text-muted-foreground">Tạo thư mục đầu tiên để tổ chức file</p>
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFolders.map((folder, index) => (
              <Card 
                key={`folder-${index}`} 
                className={`card-modern hover-glow cursor-pointer group transition-all ${
                  dragOverFolder === folder.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onDragOver={(e) => handleDragOver(e, folder.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, folder.id)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <FolderOpen className="h-5 w-5 text-yellow-500" />
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                        THƯ MỤC
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm truncate" title={folder.name}>
                        {folder.name}
                      </h3>
                      {folder.description && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {folder.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(folder.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleOpenFolder(folder)}
                      >
                        <FolderOpen className="h-3 w-3 mr-1" />
                        Mở
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDeleteFolder(folder)}
                      >
                        <Trash2 className="h-3 w-3" />
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
              <div className="space-y-2">
                {filteredFolders.map((folder, index) => (
                  <div 
                    key={`folder-${index}`} 
                    className={`flex items-center justify-between p-4 hover:bg-muted/50 group transition-all ${
                      dragOverFolder === folder.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    onDragOver={(e) => handleDragOver(e, folder.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, folder.id)}
                  >
                    <div className="flex items-center gap-3">
                      <FolderOpen className="h-5 w-5 text-yellow-500" />
                      <div>
                        <h3 className="font-medium">{folder.name}</h3>
                        {folder.description && (
                          <p className="text-sm text-muted-foreground">{folder.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleOpenFolder(folder)}
                      >
                        <FolderOpen className="h-3 w-3 mr-1" />
                        Mở
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDeleteFolder(folder)}
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

      {/* Files */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <File className="h-5 w-5" />
            File ({filteredFiles.length})
          </h2>
          {filteredFiles.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFiles.size === filteredFiles.length && filteredFiles.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
                Chọn tất cả
              </label>
            </div>
          )}
        </div>
        
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
              <Card 
                key={index} 
                className={`card-modern hover-glow cursor-pointer group transition-all ${
                  selectedFiles.has(file.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, file)}
                onClick={() => handleSelectFile(file.id)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      {getFileIcon(file.mimeType)}
                      <Badge variant="outline" className={getTypeColor(file.mimeType)}>
                        {getFileExtension(file.originalName)}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm truncate" title={file.originalName}>
                        {file.originalName}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <HardDrive className="h-3 w-3" />
                        <span>{formatFileSize(parseInt(file.size))}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(file.uploadedAt)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(file);
                        }}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Tải
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(file);
                        }}
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
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer group transition-all ${
                      selectedFiles.has(file.id) ? 'bg-blue-50' : ''
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, file)}
                    onClick={() => handleSelectFile(file.id)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(file.mimeType)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{file.originalName}</h3>
                          <Badge variant="outline" className={getTypeColor(file.mimeType)}>
                            {getFileExtension(file.originalName)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span>{formatFileSize(parseInt(file.size))}</span>
                          <span>{file.mimeType}</span>
                          <span>{formatDate(file.uploadedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(file);
                        }}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Tải
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(file);
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Xem
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(file);
                        }}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa file</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Bạn có chắc chắn muốn xóa {selectedFiles.size} file(s) đã chọn? 
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Hủy
              </Button>
              <Button variant="destructive" onClick={handleDeleteSelected}>
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* File Details Dialog */}
      <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết file</DialogTitle>
          </DialogHeader>
          {selectedFile && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tên file</Label>
                  <p className="text-sm text-muted-foreground">{selectedFile.originalName}</p>
                </div>
                <div>
                  <Label>Kích thước</Label>
                  <p className="text-sm text-muted-foreground">{formatFileSize(parseInt(selectedFile.size))}</p>
                </div>
                <div>
                  <Label>Loại file</Label>
                  <p className="text-sm text-muted-foreground">{selectedFile.mimeType}</p>
                </div>
                <div>
                  <Label>Phần mở rộng</Label>
                  <p className="text-sm text-muted-foreground">.{selectedFile.extension}</p>
                </div>
                <div>
                  <Label>Ngày tải lên</Label>
                  <p className="text-sm text-muted-foreground">{formatDate(selectedFile.uploadedAt)}</p>
                </div>
                <div>
                  <Label>Trạng thái</Label>
                  <Badge variant={selectedFile.isPublic ? "default" : "secondary"}>
                    {selectedFile.isPublic ? "Công khai" : "Riêng tư"}
                  </Badge>
                </div>
              </div>
              {selectedFile.description && (
                <div>
                  <Label>Mô tả</Label>
                  <p className="text-sm text-muted-foreground">{selectedFile.description}</p>
                </div>
              )}
              {selectedFile.tags && selectedFile.tags.length > 0 && (
                <div>
                  <Label>Thẻ</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedFile.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedFile(null)}>
                  Đóng
                </Button>
                <Button onClick={() => handleDownload(selectedFile)}>
                  <Download className="h-4 w-4 mr-2" />
                  Tải xuống
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Explorer;