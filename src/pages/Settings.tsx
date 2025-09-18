import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings as SettingsIcon,
  User,
  Shield,
  Bell,
  HardDrive,
  Key,
  Users,
  Database,
  Globe,
  Smartphone,
  Mail,
  Lock,
  AlertTriangle
} from "lucide-react";

const Settings = () => {
  const storageUsage = {
    used: 2.4,
    total: 4.0,
    percentage: 60
  };

  const securitySettings = [
    { id: "two-factor", label: "Xác thực 2 bước", description: "Tăng cường bảo mật với OTP", enabled: true },
    { id: "email-alerts", label: "Cảnh báo email", description: "Nhận thông báo khi có hoạt động đáng ngờ", enabled: true },
    { id: "login-alerts", label: "Thông báo đăng nhập", description: "Gửi email khi đăng nhập từ thiết bị mới", enabled: false },
    { id: "auto-logout", label: "Tự động đăng xuất", description: "Đăng xuất sau 30 phút không hoạt động", enabled: true }
  ];

  const notificationSettings = [
    { id: "upload-complete", label: "Hoàn thành tải lên", description: "Thông báo khi file được tải lên thành công", enabled: true },
    { id: "storage-warning", label: "Cảnh báo dung lượng", description: "Thông báo khi dung lượng gần đầy", enabled: true },
    { id: "share-access", label: "Truy cập chia sẻ", description: "Thông báo khi có người truy cập file chia sẻ", enabled: false },
    { id: "weekly-report", label: "Báo cáo tuần", description: "Tóm tắt hoạt động hàng tuần", enabled: true }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cài đặt</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý tài khoản và tùy chỉnh hệ thống
          </p>
        </div>
        <Button className="gradient-primary hover-glow">
          <Database className="h-4 w-4 mr-2" />
          Sao lưu cài đặt
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
                  <User className="h-8 w-8 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <Button variant="outline" className="hover-glow">
                    Thay đổi ảnh
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG hoặc GIF (tối đa 2MB)
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Họ</Label>
                  <Input id="firstName" value="Nguyễn" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Tên</Label>
                  <Input id="lastName" value="Văn A" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value="admin@mongit.com" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input id="phone" value="+84 123 456 789" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Vai trò</Label>
                <div className="flex items-center gap-2">
                  <Badge className="gradient-primary">Administrator</Badge>
                  <span className="text-sm text-muted-foreground">
                    Quyền truy cập toàn bộ hệ thống
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Bảo mật
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Mật khẩu</p>
                      <p className="text-sm text-muted-foreground">
                        Thay đổi lần cuối: 3 tháng trước
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="hover-glow">
                    Đổi mật khẩu
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                {securitySettings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{setting.label}</p>
                        {setting.enabled && (
                          <Badge variant="outline" className="text-xs">
                            Bật
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {setting.description}
                      </p>
                    </div>
                    <Switch checked={setting.enabled} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Thông báo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {notificationSettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{setting.label}</p>
                      {setting.enabled && (
                        <Badge variant="outline" className="text-xs">
                          Bật
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {setting.description}
                    </p>
                  </div>
                  <Switch checked={setting.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Storage Info */}
          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Dung lượng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {storageUsage.used} TB
                </div>
                <p className="text-sm text-muted-foreground">
                  của {storageUsage.total} TB
                </p>
              </div>
              
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="gradient-primary h-3 rounded-full transition-all duration-500"
                  style={{ width: `${storageUsage.percentage}%` }}
                ></div>
              </div>
              
              <div className="text-center">
                <Button className="w-full gradient-primary hover-glow">
                  Nâng cấp gói
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Hành động nhanh
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start hover-glow">
                <Users className="h-4 w-4 mr-2" />
                Quản lý người dùng
              </Button>
              <Button variant="outline" className="w-full justify-start hover-glow">
                <Globe className="h-4 w-4 mr-2" />
                Cài đặt miền
              </Button>
              <Button variant="outline" className="w-full justify-start hover-glow">
                <Smartphone className="h-4 w-4 mr-2" />
                Ứng dụng di động
              </Button>
              <Button variant="outline" className="w-full justify-start hover-glow">
                <Mail className="h-4 w-4 mr-2" />
                Cấu hình email
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="card-modern border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Khu vực nguy hiểm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start text-destructive border-destructive/20 hover:bg-destructive/10">
                <Lock className="h-4 w-4 mr-2" />
                Khóa tài khoản
              </Button>
              <Button variant="outline" className="w-full justify-start text-destructive border-destructive/20 hover:bg-destructive/10">
                <Database className="h-4 w-4 mr-2" />
                Xóa tất cả dữ liệu
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;