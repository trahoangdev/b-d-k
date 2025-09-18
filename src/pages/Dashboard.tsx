import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  Database, 
  Users, 
  Activity, 
  TrendingUp,
  HardDrive,
  Clock,
  Shield,
  Plus
} from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      title: "Tổng dung lượng",
      value: "2.4 TB",
      change: "+12%",
      icon: HardDrive,
      trend: "up"
    },
    {
      title: "Tổng file",
      value: "1,234,567",
      change: "+8%",
      icon: Database,
      trend: "up"
    },
    {
      title: "Người dùng hoạt động",
      value: "892",
      change: "+23%",
      icon: Users,
      trend: "up"
    },
    {
      title: "Lần truy cập cuối",
      value: "2 phút trước",
      change: "Real-time",
      icon: Clock,
      trend: "neutral"
    }
  ];

  const recentActivities = [
    {
      user: "Nguyễn Văn A",
      action: "đã tải lên",
      target: "dataset-2024-Q1.csv",
      time: "5 phút trước",
      type: "upload"
    },
    {
      user: "Lê Thị B",
      action: "đã truy cập",
      target: "Analytics Dashboard",
      time: "12 phút trước",
      type: "access"
    },
    {
      user: "Trần Văn C",
      action: "đã xóa",
      target: "old-backup.zip",
      time: "1 giờ trước",
      type: "delete"
    },
    {
      user: "Phạm Thị D",
      action: "đã chia sẻ",
      target: "financial-report.pdf",
      time: "2 giờ trước",
      type: "share"
    }
  ];

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
          <Button className="gradient-primary hover-glow">
            <Plus className="h-4 w-4 mr-2" />
            Tạo mới
          </Button>
          <Button variant="outline" className="hover-glow">
            <Upload className="h-4 w-4 mr-2" />
            Tải lên
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
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
            <Button className="w-full justify-start gradient-primary hover-glow">
              <Upload className="h-4 w-4 mr-2" />
              Tải lên file
            </Button>
            <Button variant="outline" className="w-full justify-start hover-glow">
              <Database className="h-4 w-4 mr-2" />
              Tạo thư mục
            </Button>
            <Button variant="outline" className="w-full justify-start hover-glow">
              <Users className="h-4 w-4 mr-2" />
              Mời người dùng
            </Button>
            <Button variant="outline" className="w-full justify-start hover-glow">
              <Shield className="h-4 w-4 mr-2" />
              Cài đặt bảo mật
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Hoạt động gần đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>
                      <span className="text-muted-foreground"> {activity.action} </span>
                      <span className="font-medium">{activity.target}</span>
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;