import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { fileApi, authApi, folderApi, File as ApiFile, Folder } from "@/services/api";
import { 
  Upload, 
  Database, 
  Users, 
  Activity, 
  TrendingUp,
  HardDrive,
  Clock,
  Shield,
  Plus,
  AlertCircle,
  Loader2,
  File,
  Download,
  Share2,
  Eye
} from "lucide-react";

interface DashboardStats {
  totalFiles: number;
  totalFolders: number;
  totalSize: number;
  recentFiles: ApiFile[];
  storageByType: {
    documents: { size: number; count: number };
    images: { size: number; count: number };
    videos: { size: number; count: number };
    others: { size: number; count: number };
  };
}

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [profileResponse, filesResponse, foldersResponse] = await Promise.all([
        authApi.getProfile(),
        fileApi.getFiles(),
        folderApi.getFolders()
      ]);

      if (profileResponse.success && filesResponse.success && foldersResponse.success) {
        const files = filesResponse.data?.files || [];
        const folders = foldersResponse.data?.folders || [];
        
        // Calculate total size
        const totalSize = files.reduce((sum, file) => sum + parseInt(file.size), 0);
        
        // Categorize files by type
        const storageByType = {
          documents: { size: 0, count: 0 },
          images: { size: 0, count: 0 },
          videos: { size: 0, count: 0 },
          others: { size: 0, count: 0 }
        };

        files.forEach(file => {
          const size = parseInt(file.size);
          const mimeType = file.mimeType?.toLowerCase() || '';
          
          if (mimeType.includes('image/')) {
            storageByType.images.size += size;
            storageByType.images.count += 1;
          } else if (mimeType.includes('video/')) {
            storageByType.videos.size += size;
            storageByType.videos.count += 1;
          } else if (mimeType.includes('application/pdf') || 
                     mimeType.includes('text/') || 
                     mimeType.includes('application/msword') ||
                     mimeType.includes('application/vnd.openxmlformats')) {
            storageByType.documents.size += size;
            storageByType.documents.count += 1;
          } else {
            storageByType.others.size += size;
            storageByType.others.count += 1;
          }
        });
        
        setStats({
          totalFiles: files.length,
          totalFolders: folders.length,
          totalSize,
          recentFiles: files.slice(0, 5),
          storageByType
        });
      }
    } catch (error) {
      setError('Không thể tải dữ liệu dashboard');
      console.error('Dashboard error:', error);
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

  const dashboardStats = [
    {
      title: "Tổng dung lượng",
      value: stats ? formatFileSize(stats.totalSize) : "0 Bytes",
      change: "+12%",
      icon: HardDrive,
      trend: "up"
    },
    {
      title: "Tổng file",
      value: stats ? stats.totalFiles.toLocaleString() : "0",
      change: "+8%",
      icon: Database,
      trend: "up"
    },
    {
      title: "Thư mục",
      value: stats ? stats.totalFolders.toLocaleString() : "0",
      change: "+5%",
      icon: Users,
      trend: "up"
    },
    {
      title: "Lần truy cập cuối",
      value: "Vừa xong",
      change: "Real-time",
      icon: Clock,
      trend: "neutral"
    }
  ];

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

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tổng quan</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý và theo dõi hệ thống lưu trữ dữ liệu của bạn
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="hover-glow"
            onClick={loadDashboardData}
          >
            <Activity className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          <Button 
            className="gradient-primary hover-glow"
            onClick={() => navigate('/explorer')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Tạo mới
          </Button>
          <Button 
            variant="outline" 
            className="hover-glow"
            onClick={() => navigate('/upload')}
          >
            <Upload className="h-4 w-4 mr-2" />
            Tải lên
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <Card key={index} className="card-modern hover-glow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-success mr-1" />
                <span className="text-xs text-success">{stat.change}</span>
                <span className="text-xs text-muted-foreground ml-1">so với tháng trước</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Thống kê file
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tài liệu:</span>
                  <span className="font-medium">{stats.storageByType.documents.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Hình ảnh:</span>
                  <span className="font-medium">{stats.storageByType.images.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Video:</span>
                  <span className="font-medium">{stats.storageByType.videos.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Khác:</span>
                  <span className="font-medium">{stats.storageByType.others.count}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Dung lượng theo loại
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tài liệu:</span>
                  <span className="font-medium">{formatFileSize(stats.storageByType.documents.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Hình ảnh:</span>
                  <span className="font-medium">{formatFileSize(stats.storageByType.images.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Video:</span>
                  <span className="font-medium">{formatFileSize(stats.storageByType.videos.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Khác:</span>
                  <span className="font-medium">{formatFileSize(stats.storageByType.others.size)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Tổng quan hệ thống
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tổng file:</span>
                  <span className="font-medium">{stats.totalFiles}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tổng thư mục:</span>
                  <span className="font-medium">{stats.totalFolders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Dung lượng:</span>
                  <span className="font-medium">{formatFileSize(stats.totalSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Trung bình/file:</span>
                  <span className="font-medium">
                    {stats.totalFiles > 0 ? formatFileSize(Math.floor(stats.totalSize / stats.totalFiles)) : '0 Bytes'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Storage Usage */}
        <Card className="card-modern lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Sử dụng dung lượng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats && stats.totalSize > 0 ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tài liệu ({stats.storageByType.documents.count} files)</span>
                      <span>{formatFileSize(stats.storageByType.documents.size)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="gradient-primary h-2 rounded-full" 
                        style={{ 
                          width: `${stats.totalSize > 0 ? (stats.storageByType.documents.size / stats.totalSize * 100) : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Hình ảnh ({stats.storageByType.images.count} files)</span>
                      <span>{formatFileSize(stats.storageByType.images.size)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ 
                          width: `${stats.totalSize > 0 ? (stats.storageByType.images.size / stats.totalSize * 100) : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Video ({stats.storageByType.videos.count} files)</span>
                      <span>{formatFileSize(stats.storageByType.videos.size)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ 
                          width: `${stats.totalSize > 0 ? (stats.storageByType.videos.size / stats.totalSize * 100) : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Khác ({stats.storageByType.others.count} files)</span>
                      <span>{formatFileSize(stats.storageByType.others.size)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ 
                          width: `${stats.totalSize > 0 ? (stats.storageByType.others.size / stats.totalSize * 100) : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <HardDrive className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Chưa có dữ liệu</p>
                  <p className="text-sm">Tải lên file để xem thống kê</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Hành động nhanh
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start gradient-primary hover-glow"
              onClick={() => navigate('/upload')}
            >
              <Upload className="h-4 w-4 mr-2" />
              Tải lên file
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start hover-glow"
              onClick={() => navigate('/explorer')}
            >
              <Database className="h-4 w-4 mr-2" />
              Tạo thư mục
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start hover-glow"
              onClick={() => navigate('/users')}
            >
              <Users className="h-4 w-4 mr-2" />
              Mời người dùng
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start hover-glow"
              onClick={() => navigate('/settings')}
            >
              <Shield className="h-4 w-4 mr-2" />
              Cài đặt bảo mật
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Files */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            File gần đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats && stats.recentFiles.length > 0 ? (
              stats.recentFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <File className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{file.originalName}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(parseInt(file.size))}</span>
                        <span>•</span>
                        <span>{file.mimeType}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{formatDate(file.uploadedAt)}</span>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => fileApi.downloadFile(file.id)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Chưa có file nào</p>
                <p className="text-sm">Tải lên file đầu tiên để bắt đầu</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;