import { Layout, Menu } from 'antd';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  Fish,
  UtensilsCrossed,
  Droplets,
  Bug,
  CloudLightning,
  ShoppingCart,
  DollarSign,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store';

const { Sider } = Layout;

const menuItems = [
  { key: '/dashboard', label: '工作台', icon: LayoutDashboard },
  { key: '/cage', label: '网箱台账', icon: Boxes },
  { key: '/fry', label: '苗种投放', icon: Fish },
  { key: '/feeding', label: '投喂管理', icon: UtensilsCrossed },
  { key: '/water', label: '水质监测', icon: Droplets },
  { key: '/disease', label: '病害防控', icon: Bug },
  { key: '/typhoon', label: '台风防御', icon: CloudLightning },
  { key: '/harvest', label: '收获销售', icon: ShoppingCart },
  { key: '/finance', label: '养殖收支', icon: DollarSign },
  { key: '/settings', label: '系统设置', icon: Settings },
];

const Sidebar = () => {
  const location = useLocation();
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();
  
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith('/cage')) return '/cage';
    if (path.startsWith('/feeding')) return '/feeding';
    if (path.startsWith('/water')) return '/water';
    if (path.startsWith('/disease')) return '/disease';
    if (path.startsWith('/typhoon')) return '/typhoon';
    if (path.startsWith('/harvest')) return '/harvest';
    if (path.startsWith('/settings')) return '/settings';
    return path;
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={sidebarCollapsed}
      width={240}
      className="bg-ocean-800 border-r border-ocean-700"
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-ocean-700">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-ocean-500 rounded-lg flex items-center justify-center">
              <Fish className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">海洋牧场</span>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="w-8 h-8 bg-ocean-500 rounded-lg flex items-center justify-center mx-auto">
            <Fish className="w-5 h-5 text-white" />
          </div>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="text-ocean-300 hover:text-white transition-colors p-1"
        >
          {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
      
      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        className="border-0 bg-transparent mt-2"
        items={menuItems.map((item) => ({
          key: item.key,
          icon: <item.icon className="w-5 h-5" />,
          label: (
            <NavLink to={item.key} className="text-ocean-100 hover:text-white">
              {item.label}
            </NavLink>
          ),
        }))}
        style={{
          background: 'transparent',
        }}
      />
      
      <style>{`
        .ant-menu-item {
          margin: 4px 8px !important;
          border-radius: 8px !important;
        }
        .ant-menu-item-selected {
          background: linear-gradient(90deg, #20B2AA 0%, #0E7490 100%) !important;
        }
        .ant-menu-item-selected .ant-menu-title-content a {
          color: white !important;
        }
        .ant-menu-item:hover {
          background: rgba(32, 178, 170, 0.2) !important;
        }
        .ant-menu-inline .ant-menu-item::after {
          border-right: none !important;
        }
        .ant-menu-item .anticon, .ant-menu-item .ant-menu-item-icon {
          color: inherit !important;
        }
      `}</style>
    </Sider>
  );
};

export default Sidebar;
