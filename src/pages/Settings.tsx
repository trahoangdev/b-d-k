import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/services/api";
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
  AlertTriangle,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";

const Settings = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [securitySettings, setSecuritySettings] = useState([
    { id: "two-factor", label: "Xác thực 2 bước", description: "Tăng cường bảo mật với OTP", enabled: false },
    { id: "email-alerts", label: "Cảnh báo email", description: "Nhận thông báo khi có hoạt động đáng ngờ", enabled: true },
    { id: "login-alerts", label: "Thông báo đăng nhập", description: "Gửi email khi đăng nhập từ thiết bị mới", enabled: false },
    { id: "auto-logout", label: "Tự động đăng xuất", description: "Đăng xuất sau 30 phút không hoạt động", enabled: true }
  ]);

  const [notificationSettings, setNotificationSettings] = useState([
    { id: "upload-complete", label: "Hoàn thành tải lên", description: "Thông báo khi file được tải lên thành công", enabled: true },
    { id: "storage-warning", label: "Cảnh báo dung lượng", description: "Thông báo khi dung lượng gần đầy", enabled: true },
    { id: "share-access", label: "Truy cập chia sẻ", description: "Thông báo khi có người truy cập file chia sẻ", enabled: false },
    { id: "weekly-report", label: "Báo cáo tuần", description: "Tóm tắt hoạt động hàng tuần", enabled: true }
  ]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadProfile();
    }
  }, [isAuthenticated, user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await authApi.getProfile();
      if (response.success && response.data?.user) {
        const userData = response.data.user;
        setProfile({
          firstName: userData.first_name || '',
          lastName: userData.last_name || '',
          email: userData.email || '',
          phone: ''
        });
      }
    } catch (error) {
      setError('Không thể tải thông tin profile');
      console.error('Load profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      // TODO: Implement updateProfile API
      // const response = await authApi.updateProfile({
      //   firstName: profile.firstName,
      //   lastName: profile.lastName,
      //   avatar: null
      // });
      
      // Mock response for now
      const response = { success: true };
      
      if (response.success) {
        setSuccess('Cập nhật profile thành công');
      } else {
        setError('Không thể cập nhật profile');
      }
    } catch (error) {
      setError('Không thể cập nhật profile');
      console.error('Update profile error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (password.new !== password.confirm) {
      setError('Mật khẩu mới không khớp');
      return;
    }
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      // TODO: Implement change password API
      // const response = await authApi.changePassword({
      //   currentPassword: password.current,
      //   newPassword: password.new
      // });
      
      setSuccess('Đổi mật khẩu thành công');
      setPassword({ current: '', new: '', confirm: '' });
    } catch (error) {
      setError('Không thể đổi mật khẩu');
      console.error('Change password error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSecuritySettingChange = (id: string, enabled: boolean) => {
    setSecuritySettings(prev => 
      prev.map(setting => 
        setting.id === id ? { ...setting, enabled } : setting
      )
    );
  };

  const handleNotificationSettingChange = (id: string, enabled: boolean) => {
    setNotificationSettings(prev => 
      prev.map(setting => 
        setting.id === id ? { ...setting, enabled } : setting
      )
    );
  };

  const storageUsage = {
    used: 2.4,
    total: 4.0,
    percentage: 60
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Đang tải cài đặt...</p>
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
          <h1 className="text-3xl font-bold text-foreground">Cài đặt</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý tài khoản và tùy chỉnh hệ thống
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="hover-glow" onClick={loadProfile}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          <Button 
            className="gradient-primary hover-glow"
            onClick={() => {
              // Export settings as JSON
              const settingsData = {
                profile: profile,
                securitySettings: securitySettings,
                notificationSettings: notificationSettings,
                exportDate: new Date().toISOString(),
                version: '1.0.0'
              };
              
              const jsonContent = JSON.stringify(settingsData, null, 2);
              const blob = new Blob([jsonContent], { type: 'application/json' });
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `settings-backup-${new Date().toISOString().split('T')[0]}.json`;
              link.click();
              window.URL.revokeObjectURL(url);
              
              setSuccess('Cài đặt đã được sao lưu thành công!');
            }}
          >
            <Database className="h-4 w-4 mr-2" />
            Sao lưu cài đặt
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
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

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
                  <Input 
                    id="firstName" 
                    value={profile.firstName}
                    onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                    placeholder="Nhập họ"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Tên</Label>
                  <Input 
                    id="lastName" 
                    value={profile.lastName}
                    onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                    placeholder="Nhập tên"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={profile.email}
                  readOnly
                  className="bg-muted"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input 
                  id="phone" 
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  placeholder="Nhập số điện thoại"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Vai trò</Label>
                <div className="flex items-center gap-2">
                  <Badge className="gradient-primary">{user?.role || 'USER'}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {user?.role === 'ADMIN' ? 'Quyền truy cập toàn bộ hệ thống' : 'Quyền truy cập cơ bản'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="gradient-primary hover-glow"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Lưu thay đổi
                    </>
                  )}
                </Button>
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
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                    <Input 
                      id="currentPassword"
                      type="password"
                      value={password.current}
                      onChange={(e) => setPassword({...password, current: e.target.value})}
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                    <Input 
                      id="newPassword"
                      type="password"
                      value={password.new}
                      onChange={(e) => setPassword({...password, new: e.target.value})}
                      placeholder="Nhập mật khẩu mới"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                    <Input 
                      id="confirmPassword"
                      type="password"
                      value={password.confirm}
                      onChange={(e) => setPassword({...password, confirm: e.target.value})}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                  </div>
                  <Button 
                    onClick={handleChangePassword}
                    disabled={saving || !password.current || !password.new || !password.confirm}
                    className="gradient-primary hover-glow"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang đổi...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 mr-2" />
                        Đổi mật khẩu
                      </>
                    )}
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
                    <Switch 
                      checked={setting.enabled}
                      onCheckedChange={(checked) => handleSecuritySettingChange(setting.id, checked)}
                    />
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
                  <Switch 
                    checked={setting.enabled}
                    onCheckedChange={(checked) => handleNotificationSettingChange(setting.id, checked)}
                  />
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