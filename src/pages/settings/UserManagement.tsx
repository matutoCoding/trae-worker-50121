import { useState, useMemo } from 'react';
import {
  Card, Table, Form, Input, Select, Button, Avatar, Tag,
  Modal, Drawer, Statistic, Space, Row, Col, List,
} from 'antd';
import {
  Users, UserPlus, Edit, Trash2, Eye, Phone, Mail, Clock,
} from 'lucide-react';
import dayjs from 'dayjs';
import { useAppStore } from '@/store';
import type { User } from '@/types';

const { Option } = Select;
const PRIMARY_COLOR = '#0E4D7A';

const roleMap: Record<string, string> = {
  admin: '管理员', manager: '养殖主管', worker: '养殖员', finance: '财务',
};

const roleColors: Record<string, string> = {
  admin: 'magenta', manager: 'blue', worker: 'green', finance: 'orange',
};

const statusMap: Record<string, { text: string; color: string }> = {
  active: { text: '正常', color: 'success' },
  inactive: { text: '禁用', color: 'default' },
};

export default function UserManagement() {
  const { users, currentUser } = useAppStore();
  const [roleFilter, setRoleFilter] = useState<string>();
  const [statusFilter, setStatusFilter] = useState<string>();
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const filteredUsers = useMemo(() => users.filter(u => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (statusFilter && u.status !== statusFilter) return false;
    if (searchText && !u.name.includes(searchText) && !u.username.includes(searchText)) return false;
    return true;
  }), [users, roleFilter, statusFilter, searchText]);

  const stats = useMemo(() => ({
    total: users.length,
    online: Math.floor(users.length * 0.6),
    active: users.filter(u => u.status === 'active').length,
    pending: 2,
  }), [users]);

  const records = {
    login: [
      { id: '1', time: '2026-06-17 09:30', ip: '192.168.1.100', device: 'Chrome/Windows' },
      { id: '2', time: '2026-06-16 14:20', ip: '192.168.1.100', device: 'Chrome/Windows' },
    ],
    operation: [
      { id: '1', time: '2026-06-17 10:00', action: '修改水质阈值', module: '水质监测' },
      { id: '2', time: '2026-06-17 09:45', action: '新增投喂计划', module: '投喂管理' },
    ],
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setModalVisible(true);
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setDrawerVisible(true);
  };

  const handleDelete = (user: User) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除用户 "${user.name}" 吗？`,
      onOk: () => Modal.success({ content: '删除成功' }),
    });
  };

  const handleSubmit = () => {
    form.validateFields().then(() => {
      Modal.success({ content: editingUser ? '编辑成功' : '新增成功' });
      setModalVisible(false);
    });
  };

  const ActionButton = ({ icon: Icon, onClick, danger }: { icon: any; onClick: () => void; danger?: boolean }) => (
    <Button type="text" danger={danger} icon={<Icon className="w-4 h-4" />} onClick={onClick} />
  );

  const columns = [
    { title: '头像', dataIndex: 'avatar', width: 80, render: (_: string, r: User) => <Avatar src={r.avatar}>{r.name.charAt(0)}</Avatar> },
    { title: '用户名', dataIndex: 'username' },
    { title: '姓名', dataIndex: 'name' },
    { title: '角色', dataIndex: 'role', render: (r: string) => <Tag color={roleColors[r]}>{roleMap[r]}</Tag> },
    { title: '手机号', dataIndex: 'phone' },
    { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={statusMap[s].color}>{statusMap[s].text}</Tag> },
    { title: '创建时间', dataIndex: 'id', render: () => dayjs().subtract(Math.random() * 30, 'day').format('YYYY-MM-DD') },
    { title: '操作', width: 150, render: (_: unknown, r: User) => (
      <Space>
        <ActionButton icon={Eye} onClick={() => handleView(r)} />
        <ActionButton icon={Edit} onClick={() => handleEdit(r)} />
        <ActionButton icon={Trash2} onClick={() => handleDelete(r)} danger />
      </Space>
    ) },
  ];

  const statCards = [
    { title: '总用户数', value: stats.total, icon: Users, gradient: 'from-blue-500 to-cyan-400' },
    { title: '在线用户', value: stats.online, icon: Users, gradient: 'from-green-500 to-emerald-400' },
    { title: '活跃用户', value: stats.active, icon: Users, gradient: 'from-purple-500 to-pink-400' },
    { title: '待审核', value: stats.pending, icon: Users, gradient: 'from-orange-500 to-amber-400' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: PRIMARY_COLOR }}>用户管理</h1>
        <p className="text-gray-500">管理系统用户账户和权限</p>
      </div>

      <Row gutter={24} className="mb-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Col span={6} key={idx}>
              <Card className="rounded-xl shadow-sm border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <Statistic title={card.title} value={card.value} />
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Card className="rounded-xl shadow-sm border-0">
        <div className="flex items-center justify-between mb-4">
          <Space>
            <Select
              placeholder="按角色筛选"
              allowClear
              style={{ width: 140 }}
              value={roleFilter}
              onChange={setRoleFilter}
            >
              {Object.entries(roleMap).map(([key, label]) => (
                <Option key={key} value={key}>{label}</Option>
              ))}
            </Select>
            <Select
              placeholder="按状态筛选"
              allowClear
              style={{ width: 140 }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="active">正常</Option>
              <Option value="inactive">禁用</Option>
            </Select>
            <Input.Search
              placeholder="搜索用户名/姓名"
              allowClear
              style={{ width: 240 }}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
          </Space>
          <Button type="primary" icon={<UserPlus className="w-4 h-4" />} onClick={handleAdd}>
            新增用户
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>

      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="姓名" name="name" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="角色" name="role" rules={[{ required: true, message: '请选择角色' }]}>
            <Select>
              {Object.entries(roleMap).map(([key, label]) => (
                <Option key={key} value={key}>{label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="手机号" name="phone" rules={[{ required: true, message: '请输入手机号' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="邮箱" name="email">
            <Input />
          </Form.Item>
          {!editingUser && (
            <Form.Item label="初始密码" name="password" rules={[{ required: true, message: '请输入初始密码' }]}>
              <Input.Password />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Drawer title="用户详情" width={420} open={drawerVisible} onClose={() => setDrawerVisible(false)} destroyOnClose>
        {selectedUser && (
          <div className="space-y-4">
            <div className="text-center pb-4 border-b">
              <Avatar size={64} src={selectedUser.avatar}>{selectedUser.name.charAt(0)}</Avatar>
              <h3 className="text-lg font-bold mt-2">{selectedUser.name}</h3>
              <Tag color={roleColors[selectedUser.role]} className="mt-1">{roleMap[selectedUser.role]}</Tag>
            </div>
            <div className="space-y-2">
              {[
                { icon: Users, label: '用户名', value: selectedUser.username },
                { icon: Phone, label: '手机号', value: selectedUser.phone },
                { icon: Mail, label: '邮箱', value: currentUser.id === selectedUser.id ? 'admin@oceanfarm.com' : '-' },
                { icon: Clock, label: '创建时间', value: dayjs().subtract(30, 'day').format('YYYY-MM-DD') },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500 w-16 text-sm">{item.label}</span>
                    <span className="text-sm">{item.value}</span>
                  </div>
                );
              })}
            </div>
            <div>
              <h4 className="font-medium mb-2 text-sm">登录记录</h4>
              <List size="small" dataSource={records.login} renderItem={item => (
                <List.Item>
                  <div>
                    <p className="text-xs">{item.time}</p>
                    <p className="text-xs text-gray-500">{item.ip} · {item.device}</p>
                  </div>
                </List.Item>
              )} />
            </div>
            <div>
              <h4 className="font-medium mb-2 text-sm">操作日志</h4>
              <List size="small" dataSource={records.operation} renderItem={item => (
                <List.Item>
                  <div>
                    <p className="text-xs">{item.action}</p>
                    <p className="text-xs text-gray-500">{item.time} · {item.module}</p>
                  </div>
                </List.Item>
              )} />
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
