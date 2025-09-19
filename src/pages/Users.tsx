import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { userApi, User as ApiUser } from "@/services/api";
import { 
  Users as UsersIcon, 
  UserPlus,
  Search,
  Mail,
  Shield,
  MoreHorizontal,
  Key,
  UserX,
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
  RefreshCw,
  CheckCircle,
  XCircle
} from "lucide-react";

// Use ApiUser interface from services/api.ts

const Users = () => {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [newUser, setNewUser] = useState({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    password: '',
    role: 'USER' as 'USER' | 'EDITOR' | 'ADMIN'
  });

  useEffect(() => {
    if (isAuthenticated && currentUser?.role === 'ADMIN') {
      loadUsers();
    }
  }, [isAuthenticated, currentUser]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await userApi.getUsers();
      if (response.success && response.data) {
        setUsers(response.data.users);
      } else {
        setError('Không thể tải danh sách người dùng');
      }
    } catch (error) {
      setError('Không thể tải danh sách người dùng');
      console.error('Load users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    try {
      // Validate form
      if (!newUser.email || !newUser.username || !newUser.firstName || !newUser.lastName || !newUser.password) {
        setError('Vui lòng điền đầy đủ thông tin');
        return;
      }

      const response = await userApi.createUser(newUser);
      if (response.success) {
        setSuccess(`Người dùng "${newUser.firstName} ${newUser.lastName}" đã được thêm thành công!`);
        setShowAddUser(false);
        setNewUser({ email: '', username: '', firstName: '', lastName: '', password: '', role: 'USER' as 'USER' | 'EDITOR' | 'ADMIN' });
        await loadUsers();
      } else {
        setError(response.message || 'Không thể thêm người dùng');
      }
    } catch (error) {
      setError('Không thể thêm người dùng');
      console.error('Add user error:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Bạn có chắc muốn xóa người dùng này?')) {
      try {
        const response = await userApi.deleteUser(userId);
        if (response.success) {
          setSuccess('Người dùng đã được xóa thành công!');
          await loadUsers();
        } else {
          setError(response.message || 'Không thể xóa người dùng');
        }
      } catch (error) {
        setError('Không thể xóa người dùng');
        console.error('Delete user error:', error);
      }
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await userApi.toggleUserStatus(userId);
      if (response.success) {
        const newStatus = !currentStatus;
        setSuccess(`Người dùng đã được ${newStatus ? 'kích hoạt' : 'vô hiệu hóa'} thành công!`);
        await loadUsers();
      } else {
        setError(response.message || 'Không thể thay đổi trạng thái người dùng');
      }
    } catch (error) {
      setError('Không thể thay đổi trạng thái người dùng');
      console.error('Toggle user status error:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated || currentUser?.role !== 'ADMIN') {
    return (
      <div className="p-6 space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Bạn không có quyền truy cập trang này</AlertDescription>
        </Alert>
      </div>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'editor':
        return 'bg-info/10 text-info border-info/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getStatusIndicator = (isActive: boolean) => {
    return isActive ? 'bg-success' : 'bg-muted-foreground';
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
          <h1 className="text-3xl font-bold text-foreground">Người dùng</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý và theo dõi người dùng trong hệ thống
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="hover-glow" onClick={loadUsers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
            <DialogTrigger asChild>
              <Button className="gradient-primary hover-glow">
                <UserPlus className="h-4 w-4 mr-2" />
                Thêm người dùng
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Thêm người dùng mới</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="username">Tên đăng nhập</Label>
                  <Input
                    id="username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    placeholder="username"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Họ</Label>
                    <Input
                      id="firstName"
                      value={newUser.firstName}
                      onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                      placeholder="Họ"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Tên</Label>
                    <Input
                      id="lastName"
                      value={newUser.lastName}
                      onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                      placeholder="Tên"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Mật khẩu"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Vai trò</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value as 'USER' | 'EDITOR' | 'ADMIN'})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">Người dùng</SelectItem>
                      <SelectItem value="EDITOR">Biên tập viên</SelectItem>
                      <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddUser(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleAddUser}>
                    Thêm
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm kiếm theo tên, email..." 
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

      {/* Users Table */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            Danh sách người dùng ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UsersIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Không có người dùng nào</p>
              <p className="text-sm">Thêm người dùng đầu tiên để bắt đầu</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Người dùng</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {user.firstName[0]}{user.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${getStatusIndicator(user.isActive)}`} />
                        <span className="capitalize">
                          {user.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="hover-glow"
                          onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                        >
                          {user.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="hover-glow"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="hover-glow text-destructive"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;