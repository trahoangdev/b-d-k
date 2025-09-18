import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3, 
  PieChart as PieChartIcon, 
  Activity,
  Users,
  HardDrive,
  Clock,
  Download,
  Eye,
  Share2,
  FileText,
  Calendar
} from "lucide-react";

const Analytics = () => {
  // Dữ liệu cho biểu đồ hoạt động theo thời gian
  const activityData = [
    { date: "01/09", views: 2400, downloads: 1200, shares: 800 },
    { date: "02/09", views: 1398, downloads: 980, shares: 600 },
    { date: "03/09", views: 9800, downloads: 2800, shares: 1400 },
    { date: "04/09", views: 3908, downloads: 1908, shares: 900 },
    { date: "05/09", views: 4800, downloads: 2300, shares: 1000 },
    { date: "06/09", views: 3800, downloads: 2100, shares: 700 },
    { date: "07/09", views: 4300, downloads: 2400, shares: 1100 },
  ];

  // Dữ liệu cho biểu đồ phân bố loại file
  const fileTypeData = [
    { name: "Tài liệu", value: 45 },
    { name: "Hình ảnh", value: 30 },
    { name: "Video", value: 20 },
    { name: "Khác", value: 5 },
  ];

  // Dữ liệu cho biểu đồ thống kê người dùng
  const userActivityData = [
    { hour: "00:00", active: 30 },
    { hour: "03:00", active: 20 },
    { hour: "06:00", active: 45 },
    { hour: "09:00", active: 120 },
    { hour: "12:00", active: 180 },
    { hour: "15:00", active: 150 },
    { hour: "18:00", active: 90 },
    { hour: "21:00", active: 60 },
  ];

  const metrics = [
    {
      title: "Lưu lượng truy cập",
      value: "12,543",
      change: "+15.2%",
      trend: "up",
      icon: Eye,
      period: "30 ngày qua"
    },
    {
      title: "Số lần tải xuống",
      value: "3,421",
      change: "+8.7%",
      trend: "up",
      icon: Download,
      period: "30 ngày qua"
    },
    {
      title: "Chia sẻ",
      value: "892",
      change: "-2.3%",
      trend: "down",
      icon: Share2,
      period: "30 ngày qua"
    },
    {
      title: "Thời gian trung bình",
      value: "4.2 phút",
      change: "+12.1%",
      trend: "up",
      icon: Clock,
      period: "mỗi phiên"
    }
  ];

  const COLORS = ["#6366f1", "#0ea5e9", "#f59e0b", "#10b981"];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Phân tích</h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi hiệu suất và xu hướng sử dụng hệ thống
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            30 ngày qua
          </Button>
          <Button className="gradient-primary">
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="card-modern">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <metric.icon className="h-5 w-5 text-muted-foreground" />
                <Badge 
                  variant="outline" 
                  className={metric.trend === "up" ? "text-success" : "text-destructive"}
                >
                  {metric.trend === "up" ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {metric.change}
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {metric.value}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.period}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Activity Over Time */}
        <Card className="card-modern md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Hoạt động theo thời gian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="views" name="Lượt xem" stroke="#6366f1" strokeWidth={2} />
                  <Line type="monotone" dataKey="downloads" name="Tải xuống" stroke="#0ea5e9" strokeWidth={2} />
                  <Line type="monotone" dataKey="shares" name="Chia sẻ" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* File Type Distribution */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Phân bố loại file
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fileTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {fileTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Activity */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Hoạt động người dùng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userActivityData}>
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="active" name="Người dùng hoạt động" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;