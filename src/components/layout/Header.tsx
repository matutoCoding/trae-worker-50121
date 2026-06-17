import { Layout, Badge, Avatar, Dropdown, Button } from 'antd';
import { Bell, Search, User, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useAppStore } from '@/store';

const { Header: AntHeader } = Layout;

const Header = () => {
  const { currentUser, redTideAlerts, todos } = useAppStore();
  
  const activeAlerts = redTideAlerts.filter(a => a.status === 'active').length;
  const pendingTodos = todos.filter(t => t.status === 'pending').length;

  const userMenuItems = [
    { key: 'profile', label: '个人信息', icon: <User className="w-4 h-4" /> },
    { key: 'settings', label: '系统设置', icon: <SettingsIcon className="w-4 h-4" /> },
    { type: 'divider' as const },
    { key: 'logout', label: '退出登录', icon: <LogOut className="w-4 h-4" /> },
  ];

  const notificationItems = [
    { key: 'alerts', label: `水质警报 (${activeAlerts})` },
    { key: 'todos', label: `待办事项 (${pendingTodos})` },
    { key: 'system', label: '系统通知 (2)' },
  ];

  return (
    <AntHeader className="bg-white border-b border-gray-200 px-6 h-16 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索网箱、鱼苗、记录..."
            className="pl-10 pr-4 py-2 w-80 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100 transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Dropdown menu={{ items: notificationItems }} placement="bottomRight" trigger={['click']}>
          <Button type="text" className="relative">
            <Badge count={activeAlerts + pendingTodos} size="small" offset={[5, -5]}>
              <Bell className="w-5 h-5 text-gray-600" />
            </Badge>
          </Button>
        </Dropdown>
        
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
          <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
            <Avatar className="bg-gradient-to-br from-ocean-500 to-ocean-700">
              <User className="w-4 h-4" />
            </Avatar>
            <div className="hidden md:block">
              <div className="text-sm font-medium text-gray-800">{currentUser.name}</div>
              <div className="text-xs text-gray-500">
                {currentUser.role === 'admin' ? '系统管理员' : 
                 currentUser.role === 'manager' ? '养殖主管' :
                 currentUser.role === 'finance' ? '财务人员' : '养殖员'}
              </div>
            </div>
          </div>
        </Dropdown>
      </div>
    </AntHeader>
  );
};

export default Header;
