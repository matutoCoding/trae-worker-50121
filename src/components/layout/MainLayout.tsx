import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import '@/assets/styles/global.css';

const { Content } = Layout;

const MainLayout = () => {
  return (
    <Layout className="min-h-screen bg-ocean-50">
      <Sidebar />
      <Layout>
        <Header />
        <Content className="p-6 overflow-auto">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
