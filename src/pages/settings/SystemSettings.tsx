import { useState } from 'react';
import {
  Card, Form, Input, Button, Switch, Slider, Select, List, message,
  Tag, Space, Row, Col, Statistic,
} from 'antd';
import {
  Settings, Users, Bell, Database, Info, Phone, Mail,
  MapPin, Clock, Save, Shield,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAppStore } from '@/store';

const { Option } = Select;
const PRIMARY_COLOR = '#0E4D7A';

const menuItems = [
  { key: 'basic', label: '基本设置', icon: Settings },
  { key: 'water', label: '水质阈值', icon: Shield },
  { key: 'feeding', label: '投喂设置', icon: Clock },
  { key: 'notification', label: '通知设置', icon: Bell },
  { key: 'backup', label: '数据备份', icon: Database },
  { key: 'about', label: '关于系统', icon: Info },
];

const waterParams = [
  { label: '溶氧范围 (mg/L)', name: 'doRange', range: true, min: 0, max: 20 },
  { label: '盐度范围 (‰)', name: 'salinityRange', range: true, min: 0, max: 40 },
  { label: '水温范围 (°C)', name: 'tempRange', range: true, min: 0, max: 40 },
  { label: 'pH值范围', name: 'phRange', range: true, min: 0, max: 14, step: 0.1 },
  { label: '氨氮上限 (mg/L)', name: 'ammoniaMax', range: false, min: 0, max: 0.5, step: 0.01 },
];

export default function SystemSettings() {
  const { currentUser } = useAppStore();
  const [activeKey, setActiveKey] = useState('basic');
  const [form] = Form.useForm();
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [wechatEnabled, setWechatEnabled] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState('daily');

  const backupRecords = [
    { id: '1', name: '系统备份_20260617', time: '2026-06-17 02:00', size: '128MB' },
    { id: '2', name: '系统备份_20260616', time: '2026-06-16 02:00', size: '126MB' },
    { id: '3', name: '系统备份_20260615', time: '2026-06-15 02:00', size: '125MB' },
  ];

  const handleSave = () => message.success('设置已保存');
  const handleBackup = () => {
    message.info('正在创建备份...');
    setTimeout(() => message.success('备份创建成功'), 1500);
  };
  const menuItemStyle = (key: string) => `flex items-center gap-3 px-4 py-3 cursor-pointer rounded-lg transition-colors ${activeKey === key ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`;
  const SaveBtn = () => <Form.Item><Button type="primary" icon={<Save className="w-4 h-4" />} onClick={handleSave}>保存设置</Button></Form.Item>;

  const FormInput = ({ label, name, prefix, type }: any) => (
    <Col span={12}>
      <Form.Item label={label} name={name}>
        <Input type={type} prefix={prefix} step={type === 'number' ? 0.0001 : undefined} />
      </Form.Item>
    </Col>
  );

  const renderBasicSettings = () => (
    <Card title="基本设置" className="rounded-xl shadow-sm border-0">
      <Form form={form} layout="vertical" initialValues={{
        companyName: '海洋养殖科技有限公司', phone: '400-123-4567',
        address: '山东省青岛市崂山区东海路123号', email: 'support@oceanfarm.com',
        latitude: 36.0671, longitude: 120.3826,
        timezone: 'Asia/Shanghai', dateFormat: 'YYYY-MM-DD',
      }}>
        <Row gutter={24}>
          <FormInput label="企业名称" name="companyName" prefix={<MapPin className="w-4 h-4 text-gray-400" />} />
          <FormInput label="联系电话" name="phone" prefix={<Phone className="w-4 h-4 text-gray-400" />} />
          <FormInput label="地址" name="address" />
          <FormInput label="邮箱" name="email" prefix={<Mail className="w-4 h-4 text-gray-400" />} />
          <FormInput label="纬度" name="latitude" type="number" />
          <FormInput label="经度" name="longitude" type="number" />
          <Col span={12}>
            <Form.Item label="系统时区" name="timezone">
              <Select>
                <Option value="Asia/Shanghai">中国标准时间 (UTC+8)</Option>
                <Option value="Asia/Tokyo">日本标准时间 (UTC+9)</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="日期格式" name="dateFormat">
              <Select>
                <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <SaveBtn />
      </Form>
    </Card>
  );

  const renderWaterThresholds = () => (
    <Card title="水质阈值设置" className="rounded-xl shadow-sm border-0">
      <Form layout="vertical" initialValues={{
        doRange: [5, 12], salinityRange: [20, 35], tempRange: [18, 28],
        phRange: [6.5, 8.5], ammoniaMax: 0.1,
      }}>
        {waterParams.map(param => (
          <Form.Item key={param.name} label={param.label}>
            <Form.Item name={param.name} noStyle>
              <Slider range={param.range} min={param.min} max={param.max} step={param.step} />
            </Form.Item>
          </Form.Item>
        ))}
        <SaveBtn />
      </Form>
    </Card>
  );

  const renderFeedingSettings = () => (
    <Card title="投喂设置" className="rounded-xl shadow-sm border-0">
      <Form layout="vertical" initialValues={{
        feedingTimes: ['06:00', '12:00', '18:00'], feedAmount: 50,
        feedDuration: 30, lowFeedThreshold: 20,
      }}>
        <Form.Item label="默认投喂时间" name="feedingTimes">
          <Select mode="multiple" style={{ width: '100%' }}>
            {['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'].map(t => (
              <Option key={t} value={t}>{t}</Option>
            ))}
          </Select>
        </Form.Item>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label="默认投喂量 (kg/次)" name="feedAmount">
              <Input type="number" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="投喂时长 (分钟)" name="feedDuration">
              <Input type="number" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="低饲料量预警阈值 (%)" name="lowFeedThreshold">
          <Slider min={0} max={100} />
        </Form.Item>
        <SaveBtn />
      </Form>
    </Card>
  );

  const renderNotificationSettings = () => (
    <Card title="通知设置" className="rounded-xl shadow-sm border-0">
      <div className="space-y-4">
        {[
          { label: '短信通知', desc: '接收预警短信通知', value: smsEnabled, onChange: setSmsEnabled },
          { label: '邮件通知', desc: '接收预警邮件通知', value: emailEnabled, onChange: setEmailEnabled },
          { label: '微信通知', desc: '接收微信公众号通知', value: wechatEnabled, onChange: setWechatEnabled },
        ].map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-800">{item.label}</p>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
            <Switch checked={item.value} onChange={item.onChange} />
          </div>
        ))}
        <Form layout="vertical">
          <Form.Item label="预警通知接收人">
            <Select mode="tags" style={{ width: '100%' }} placeholder="输入接收人手机号或邮箱">
              <Option value="admin@oceanfarm.com">管理员 (admin@oceanfarm.com)</Option>
              <Option value="13800138000">养殖主管 (13800138000)</Option>
            </Select>
          </Form.Item>
          <SaveBtn />
        </Form>
      </div>
    </Card>
  );

  const renderBackupSettings = () => (
    <Card title="数据备份" className="rounded-xl shadow-sm border-0">
      <div className="space-y-6">
        <Space>
          <Button type="primary" icon={<Database className="w-4 h-4" />} onClick={handleBackup}>
            手动备份
          </Button>
          <Select value={backupFrequency} onChange={setBackupFrequency} style={{ width: 150 }}>
            <Option value="daily">每日备份</Option>
            <Option value="weekly">每周备份</Option>
            <Option value="monthly">每月备份</Option>
          </Select>
        </Space>
        <List
          header={<div className="font-medium">备份记录</div>}
          dataSource={backupRecords}
          renderItem={(item) => (
            <List.Item className="flex items-center justify-between">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">{item.time} · {item.size}</p>
              </div>
              <Tag color="success">成功</Tag>
            </List.Item>
          )}
        />
      </div>
    </Card>
  );

  const renderAbout = () => (
    <Card title="关于系统" className="rounded-xl shadow-sm border-0">
      <div className="text-center py-4">
        <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
          <Settings className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-lg font-bold mb-1" style={{ color: PRIMARY_COLOR }}>智慧养殖管理系统</h2>
        <p className="text-gray-500 mb-3 text-sm">Smart Aquaculture Management System</p>
        <Row gutter={24} className="mb-3">
          <Col span={8}><Statistic title="系统版本" value="v2.1.0" /></Col>
          <Col span={8}><Statistic title="发布日期" value={dayjs('2026-05-01').format('YYYY-MM-DD')} /></Col>
          <Col span={8}><Statistic title="当前用户" value={currentUser.name} /></Col>
        </Row>
        <div className="text-left bg-gray-50 rounded-lg p-3">
          <p className="text-gray-600 text-xs">© 2026 海洋养殖科技有限公司 版权所有</p>
          <p className="text-gray-600 text-xs">技术支持：support@oceanfarm.com</p>
          <p className="text-gray-600 text-xs">客服热线：400-123-4567</p>
        </div>
      </div>
    </Card>
  );

  const renderContent = () => {
    switch (activeKey) {
      case 'basic': return renderBasicSettings();
      case 'water': return renderWaterThresholds();
      case 'feeding': return renderFeedingSettings();
      case 'notification': return renderNotificationSettings();
      case 'backup': return renderBackupSettings();
      case 'about': return renderAbout();
      default: return null;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: PRIMARY_COLOR }}>系统设置</h1>
        <p className="text-gray-500">管理系统各项配置参数</p>
      </div>
      <div className="flex gap-6">
        <div className="w-56 flex-shrink-0">
          <Card className="rounded-xl shadow-sm border-0 sticky top-6">
            <div className="space-y-1">
              {menuItems.map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.key} className={menuItemStyle(item.key)} onClick={() => setActiveKey(item.key)}>
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                );
              })}
              <Link to="/settings/users">
                <div className={menuItemStyle('users')}>
                  <Users className="w-5 h-5" />
                  <span>用户管理</span>
                </div>
              </Link>
            </div>
          </Card>
        </div>
        <div className="flex-1">{renderContent()}</div>
      </div>
    </div>
  );
}
