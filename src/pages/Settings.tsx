import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { authApi, fileApi } from "@/services/api";
import { useNavigate } from "react-router-dom";
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
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showCleanupDialog, setShowCleanupDialog] = useState(false);
  const [showLockAccountDialog, setShowLockAccountDialog] = useState(false);
  const [showDeleteDataDialog, setShowDeleteDataDialog] = useState(false);
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

  const [storageStats, setStorageStats] = useState({
    totalFiles: 0,
    totalFolders: 0,
    totalSize: '0',
    storageByType: [] as { type: string; count: number; size: string }[]
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      loadProfile();
      loadStorageStats();
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
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
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

  const loadStorageStats = async () => {
    try {
      const response = await fileApi.getStorageStats();
      if (response.success && response.data) {
        setStorageStats(response.data);
      }
    } catch (error) {
      console.error('Load storage stats error:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const response = await authApi.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone
      });
      
      if (response.success) {
        setSuccess('Cập nhật profile thành công');
      } else {
        setError(response.message || 'Không thể cập nhật profile');
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
    
    if (password.new.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const response = await authApi.changePassword({
        currentPassword: password.current,
        newPassword: password.new
      });
      
      if (response.success) {
        setSuccess('Đổi mật khẩu thành công');
        setPassword({ current: '', new: '', confirm: '' });
      } else {
        setError(response.message || 'Không thể đổi mật khẩu');
      }
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

  // Button handlers
  const handleUpgradePackage = () => {
    setShowUpgradeDialog(true);
  };

  const handleCleanupFiles = () => {
    setShowCleanupDialog(true);
  };

  const handleManageUsers = () => {
    navigate('/users');
  };

  const handleDomainSettings = () => {
    setSuccess('Chức năng cài đặt miền sẽ được phát triển trong phiên bản tiếp theo');
  };

  const handleMobileApp = () => {
    setSuccess('Ứng dụng di động sẽ được phát triển trong phiên bản tiếp theo');
  };

  const handleEmailConfig = () => {
    setSuccess('Cấu hình email sẽ được phát triển trong phiên bản tiếp theo');
  };

  const handleLockAccount = () => {
    setShowLockAccountDialog(true);
  };

  const handleDeleteAllData = () => {
    setShowDeleteDataDialog(true);
  };

  const handleChangeAvatar = () => {
    setSuccess('Chức năng thay đổi avatar sẽ được phát triển trong phiên bản tiếp theo');
  };

  // Format bytes to human readable format
  const formatBytes = (bytes: string) => {
    const size = parseInt(bytes);
    if (size === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const storageUsage = {
    used: parseFloat(storageStats.totalSize) / (1024 * 1024 * 1024), // Convert to GB
    total: 4.0, // 4GB limit
    percentage: Math.min((parseFloat(storageStats.totalSize) / (4 * 1024 * 1024 * 1024)) * 100, 100)
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
          <Button variant="outline" className="hover-glow" onClick={() => {
            loadProfile();
            loadStorageStats();
          }}>
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
                  <Button variant="outline" className="hover-glow" onClick={handleChangeAvatar}>
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
                Dung lượng lưu trữ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Main Storage Display */}
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-primary">
                  {formatBytes(storageStats.totalSize)}
                </div>
                <p className="text-sm text-muted-foreground">
                  đã sử dụng của {storageUsage.total} GB
                </p>
                <div className="text-xs text-muted-foreground">
                  {storageUsage.percentage.toFixed(1)}% đã sử dụng
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="w-full bg-muted rounded-full h-4 relative overflow-hidden">
                  <div 
                    className={`h-4 rounded-full transition-all duration-700 ${
                      storageUsage.percentage > 90 
                        ? 'bg-gradient-to-r from-red-500 to-red-600' 
                        : storageUsage.percentage > 70 
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                        : 'gradient-primary'
                    }`}
                    style={{ width: `${Math.min(storageUsage.percentage, 100)}%` }}
                  ></div>
                  {storageUsage.percentage > 90 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-white">⚠️</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0 GB</span>
                  <span>{storageUsage.total} GB</span>
                </div>
              </div>
              
              {/* File & Folder Counts */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-semibold text-primary">
                    {storageStats.totalFiles}
                  </div>
                  <div className="text-xs text-muted-foreground">Files</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-primary">
                    {storageStats.totalFolders}
                  </div>
                  <div className="text-xs text-muted-foreground">Folders</div>
                </div>
              </div>
              
              {/* Storage by Type */}
              {storageStats.storageByType.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Theo loại file</h4>
                    <Badge variant="outline" className="text-xs">
                      {storageStats.storageByType.length} loại
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {storageStats.storageByType
                      .sort((a, b) => parseInt(b.size) - parseInt(a.size))
                      .map((item, index) => {
                        const itemPercentage = (parseInt(item.size) / parseInt(storageStats.totalSize)) * 100;
                        return (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  item.type === 'Images' ? 'bg-blue-500' :
                                  item.type === 'Videos' ? 'bg-red-500' :
                                  item.type === 'Documents' ? 'bg-green-500' :
                                  item.type === 'Audio' ? 'bg-purple-500' :
                                  item.type === 'Archives' ? 'bg-orange-500' :
                                  'bg-gray-500'
                                }`}></div>
                                <span className="font-medium">{item.type}</span>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">{formatBytes(item.size)}</div>
                                <div className="text-muted-foreground">{item.count} files</div>
                              </div>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1">
                              <div 
                                className={`h-1 rounded-full transition-all duration-500 ${
                                  item.type === 'Images' ? 'bg-blue-500' :
                                  item.type === 'Videos' ? 'bg-red-500' :
                                  item.type === 'Documents' ? 'bg-green-500' :
                                  item.type === 'Audio' ? 'bg-purple-500' :
                                  item.type === 'Archives' ? 'bg-orange-500' :
                                  'bg-gray-500'
                                }`}
                                style={{ width: `${itemPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
              
              {/* Storage Warning */}
              {storageUsage.percentage > 80 && (
                <Alert className="border-orange-200 bg-orange-50 text-orange-800">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {storageUsage.percentage > 90 
                      ? 'Dung lượng gần đầy! Hãy xóa file không cần thiết hoặc nâng cấp gói.'
                      : 'Dung lượng đã sử dụng cao. Hãy cân nhắc dọn dẹp file.'
                    }
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Action Buttons */}
              <div className="space-y-2">
                <Button className="w-full gradient-primary hover-glow" onClick={handleUpgradePackage}>
                  <HardDrive className="h-4 w-4 mr-2" />
                  Nâng cấp gói
                </Button>
                <Button variant="outline" className="w-full hover-glow" onClick={handleCleanupFiles}>
                  <Database className="h-4 w-4 mr-2" />
                  Dọn dẹp file
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
              <Button variant="outline" className="w-full justify-start hover-glow" onClick={handleManageUsers}>
                <Users className="h-4 w-4 mr-2" />
                Quản lý người dùng
              </Button>
              <Button variant="outline" className="w-full justify-start hover-glow" onClick={handleDomainSettings}>
                <Globe className="h-4 w-4 mr-2" />
                Cài đặt miền
              </Button>
              <Button variant="outline" className="w-full justify-start hover-glow" onClick={handleMobileApp}>
                <Smartphone className="h-4 w-4 mr-2" />
                Ứng dụng di động
              </Button>
              <Button variant="outline" className="w-full justify-start hover-glow" onClick={handleEmailConfig}>
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
              <Button variant="outline" className="w-full justify-start text-destructive border-destructive/20 hover:bg-destructive/10" onClick={handleLockAccount}>
                <Lock className="h-4 w-4 mr-2" />
                Khóa tài khoản
              </Button>
              <Button variant="outline" className="w-full justify-start text-destructive border-destructive/20 hover:bg-destructive/10" onClick={handleDeleteAllData}>
                <Database className="h-4 w-4 mr-2" />
                Xóa tất cả dữ liệu
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upgrade Package Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Nâng cấp gói lưu trữ
            </DialogTitle>
            <DialogDescription>
              Nâng cấp gói để có thêm dung lượng lưu trữ và tính năng cao cấp.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Gói Pro</h4>
                  <Badge className="gradient-primary">Phổ biến</Badge>
                </div>
                <p className="text-2xl font-bold">$9.99<span className="text-sm font-normal text-muted-foreground">/tháng</span></p>
                <ul className="text-sm space-y-1">
                  <li>• 50 GB dung lượng lưu trữ</li>
                  <li>• Tải lên file không giới hạn</li>
                  <li>• Hỗ trợ ưu tiên</li>
                  <li>• Sao lưu tự động</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Gói Enterprise</h4>
                  <Badge variant="outline">Cao cấp</Badge>
                </div>
                <p className="text-2xl font-bold">$29.99<span className="text-sm font-normal text-muted-foreground">/tháng</span></p>
                <ul className="text-sm space-y-1">
                  <li>• 200 GB dung lượng lưu trữ</li>
                  <li>• Tất cả tính năng Pro</li>
                  <li>• API access</li>
                  <li>• Hỗ trợ 24/7</li>
                </ul>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Hủy
            </Button>
            <Button className="gradient-primary" onClick={() => {
              setShowUpgradeDialog(false);
              setSuccess('Chức năng thanh toán sẽ được tích hợp trong phiên bản tiếp theo');
            }}>
              Nâng cấp ngay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cleanup Files Dialog */}
      <Dialog open={showCleanupDialog} onOpenChange={setShowCleanupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Dọn dẹp file
            </DialogTitle>
            <DialogDescription>
              Tìm và xóa các file trùng lặp, file tạm thời để giải phóng dung lượng.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="duplicates" className="rounded" />
                <Label htmlFor="duplicates">Tìm file trùng lặp</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="temp" className="rounded" />
                <Label htmlFor="temp">Xóa file tạm thời</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="empty" className="rounded" />
                <Label htmlFor="empty">Xóa thư mục trống</Label>
              </div>
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Thao tác này không thể hoàn tác. Hãy đảm bảo bạn đã sao lưu dữ liệu quan trọng.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCleanupDialog(false)}>
              Hủy
            </Button>
            <Button className="gradient-primary" onClick={() => {
              setShowCleanupDialog(false);
              setSuccess('Chức năng dọn dẹp file sẽ được phát triển trong phiên bản tiếp theo');
            }}>
              Bắt đầu dọn dẹp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lock Account Dialog */}
      <Dialog open={showLockAccountDialog} onOpenChange={setShowLockAccountDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Lock className="h-5 w-5" />
              Khóa tài khoản
            </DialogTitle>
            <DialogDescription>
              Khóa tài khoản sẽ ngăn bạn đăng nhập và truy cập dữ liệu. Bạn có thể mở khóa sau.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Tài khoản sẽ bị khóa ngay lập tức. Bạn sẽ không thể đăng nhập cho đến khi mở khóa.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="lockReason">Lý do khóa tài khoản (tùy chọn)</Label>
              <Input 
                id="lockReason"
                placeholder="Nhập lý do khóa tài khoản..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLockAccountDialog(false)}>
              Hủy
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                setShowLockAccountDialog(false);
                setSuccess('Chức năng khóa tài khoản sẽ được phát triển trong phiên bản tiếp theo');
              }}
            >
              Khóa tài khoản
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete All Data Dialog */}
      <Dialog open={showDeleteDataDialog} onOpenChange={setShowDeleteDataDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Database className="h-5 w-5" />
              Xóa tất cả dữ liệu
            </DialogTitle>
            <DialogDescription>
              Thao tác này sẽ xóa vĩnh viễn tất cả files, folders và dữ liệu của bạn.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Cảnh báo:</strong> Thao tác này không thể hoàn tác! Tất cả dữ liệu sẽ bị xóa vĩnh viễn.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="confirmDelete">Nhập "XÓA TẤT CẢ" để xác nhận</Label>
              <Input 
                id="confirmDelete"
                placeholder="XÓA TẤT CẢ"
                className="uppercase"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDataDialog(false)}>
              Hủy
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                setShowDeleteDataDialog(false);
                setSuccess('Chức năng xóa dữ liệu sẽ được phát triển trong phiên bản tiếp theo');
              }}
            >
              Xóa tất cả dữ liệu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;