import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { fileApi, authApi, File as ApiFile } from "@/services/api";
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
  totalSize: number;
  recentFiles: ApiFile[];
  userStats: {
    fileCount: number;
    folderCount: number;
    totalSize: number;
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
      
      const [profileResponse, filesResponse] = await Promise.all([
        authApi.getProfile(),
        fileApi.getFiles()
      ]);

      if (profileResponse.success && filesResponse.success) {
        const userStats = { fileCount: 0, folderCount: 0, totalSize: 0 };
        const files = filesResponse.data?.files || [];
        
        setStats({
          totalFiles: files.length,
          totalSize: userStats.totalSize,
          recentFiles: files.slice(0, 5),
          userStats
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
      value: stats ? stats.userStats.folderCount.toLocaleString() : "0",
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
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tài liệu (45%)</span>
                  <span>1.08 TB</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="gradient-primary h-2 rounded-full" style={{ width: "45%" }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Hình ảnh (30%)</span>
                  <span>720 GB</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-info h-2 rounded-full" style={{ width: "30%" }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Video (20%)</span>
                  <span>480 GB</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-warning h-2 rounded-full" style={{ width: "20%" }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Khác (5%)</span>
                  <span>120 GB</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{ width: "5%" }}></div>
                </div>
              </div>
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
                      <p className="text-sm font-medium">{file.original_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(parseInt(file.size))}</span>
                        <span>•</span>
                        <span>{file.mime_type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{formatDate(file.uploaded_at)}</span>
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