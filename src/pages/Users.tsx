import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users as UsersIcon, 
  UserPlus,
  Search,
  Mail,
  Shield,
  MoreHorizontal,
  Key,
  UserX
} from "lucide-react";

const Users = () => {
  const users = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "nguyenvana@example.com",
      role: "Admin",
      status: "active",
      lastActive: "2 phút trước",
      storage: "1.2 TB"
    },
    {
      id: 2,
      name: "Lê Thị B",
      email: "lethib@example.com",
      role: "Editor",
      status: "active",
      lastActive: "15 phút trước",
      storage: "850 GB"
    },
    {
      id: 3,
      name: "Trần Văn C",
      email: "tranvanc@example.com",
      role: "Viewer",
      status: "inactive",
      lastActive: "3 ngày trước",
      storage: "250 GB"
    },
    {
      id: 4,
      name: "Phạm Thị D",
      email: "phamthid@example.com",
      role: "Editor",
      status: "active",
      lastActive: "1 giờ trước",
      storage: "756 GB"
    },
    {
      id: 5,
      name: "Hoàng Văn E",
      email: "hoangvane@example.com",
      role: "Viewer",
      status: "active",
      lastActive: "5 phút trước",
      storage: "124 GB"
    }
  ];

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

  const getStatusIndicator = (status: string) => {
    return status === 'active' 
      ? 'bg-success' 
      : 'bg-muted-foreground';
  };

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
        <Button className="gradient-primary hover-glow">
          <UserPlus className="h-4 w-4 mr-2" />
          Thêm người dùng
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm kiếm theo tên, email..." 
              className="pl-10 hover-glow"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            Danh sách người dùng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Người dùng</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Hoạt động cuối</TableHead>
                <TableHead>Dung lượng</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {user.name.split(" ").map(n => n[0]).join("")}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
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
                      <div className={`h-2 w-2 rounded-full ${getStatusIndicator(user.status)}`} />
                      <span className="capitalize">{user.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.lastActive}</TableCell>
                  <TableCell>{user.storage}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="hover-glow">
                        <Key className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="hover-glow">
                        <Shield className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="hover-glow">
                        <UserX className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="hover-glow">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;