import { useState, useMemo } from 'react';
import { Card, Table, Tag, Button, Form, Select, Modal, Upload, message, Row, Col } from 'antd';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Camera, AlertTriangle, Clock, Plus, ShieldCheck } from 'lucide-react';
import dayjs from 'dayjs';
import { useAppStore } from '@/store';
import type { Inspection } from '@/types';

const { Option } = Select;

const damageLevelMap: Record<string, { text: string; color: string; icon: typeof AlertTriangle }> = {
  minor: { text: '轻微', color: '#FAAD14', icon: AlertTriangle },
  moderate: { text: '中等', color: '#FA8C16', icon: AlertTriangle },
  severe: { text: '严重', color: '#F5222D', icon: AlertTriangle },
};

const statusMap: Record<string, { text: string; color: string }> = {
  normal: { text: '正常', color: 'success' },
  issue_found: { text: '待修复', color: 'warning' },
  resolved: { text: '已修复', color: 'success' },
};

const COLORS = ['#FAAD14', '#FA8C16', '#F5222D'];
const cardStyle = { header: { padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }, body: { padding: '16px 20px' } };
const chartStyle = { backgroundColor: '#111827', borderRadius: '12px', padding: '16px' };
const tooltipStyle = { backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' };

const formOptions = {
  locations: ['东北角', '东南角', '西北角', '西南角', '底部中央', '侧壁'],
  sizes: ['5cm×5cm', '10cm×10cm', '10cm×15cm', '20cm×20cm', '大于30cm'],
  levels: [{ v: 'minor', t: '轻微（黄色）' }, { v: 'moderate', t: '中等（橙色）' }, { v: 'severe', t: '严重（红色）' }],
  measures: ['使用专用修补网片进行缝合修复', '更换破损区域网衣', '安排专业人员修复', '临时绑扎固定，计划更换'],
};

export default function NetCheck() {
  const { inspections, cages, currentUser, addInspection } = useAppStore();
  const [selectedCage, setSelectedCage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const netChecks = useMemo(() =>
    inspections.filter(i => i.type === 'net_check')
      .sort((a, b) => new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime()),
    [inspections]
  );

  const cageStatuses = useMemo(() => cages.map(cage => {
    const lastCheck = netChecks.find(i => i.cageId === cage.id);
    const lastCheckDate = lastCheck?.inspectionDate;
    const daysSinceCheck = lastCheckDate ? dayjs().diff(dayjs(lastCheckDate), 'day') : null;
    return {
      ...cage, lastCheck: lastCheckDate, daysSinceCheck,
      status: lastCheck?.status === 'issue_found' ? 'issue_found' : lastCheck ? 'normal' : 'pending',
      damageLevel: lastCheck?.damageLevel,
    };
  }), [cages, netChecks]);

  const damageByLevel = useMemo(() => {
    const counts = { minor: 0, moderate: 0, severe: 0 };
    netChecks.forEach(n => { if (n.damageLevel) counts[n.damageLevel]++; });
    return [{ name: '轻微', value: counts.minor }, { name: '中等', value: counts.moderate }, { name: '严重', value: counts.severe }];
  }, [netChecks]);

  const damageByCage = useMemo(() => {
    const map: Record<string, number> = {};
    netChecks.forEach(n => {
      if (n.damageLevel) {
        const cageName = cages.find(c => c.id === n.cageId)?.name || n.cageId;
        map[cageName] = (map[cageName] || 0) + 1;
      }
    });
    return Object.entries(map).slice(0, 8).map(([name, count]) => ({ name, 破损次数: count }));
  }, [netChecks, cages]);

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const newRecord: Inspection = {
        id: `inspect-${Date.now()}`,
        cageId: selectedCage || values.cageId,
        type: 'net_check',
        inspectionDate: dayjs().format('YYYY-MM-DD'),
        inspector: currentUser.name,
        findings: `网衣破损位置：${values.location}，大小：${values.size}`,
        photos: [], status: 'issue_found',
        damageLevel: values.damageLevel, repairMeasures: values.repairMeasures,
      };
      message.success('检查记录已保存');
      setModalVisible(false); form.resetFields(); setSelectedCage(null);
      addInspection(newRecord);
    });
  };

  const openModal = (cageId: string | null = null) => {
    setSelectedCage(cageId);
    setModalVisible(true);
  };

  const columns = [
    { title: '网箱', dataIndex: 'cageId', render: (id: string) => cages.find(c => c.id === id)?.name || id },
    { title: '检查日期', dataIndex: 'inspectionDate', width: 110 },
    { title: '检查人员', dataIndex: 'inspector', width: 100 },
    { title: '破损位置', dataIndex: 'findings', render: (f: string) => f.includes('：') ? f.split('，')[0].split('：')[1] : '-' },
    { title: '破损程度', dataIndex: 'damageLevel', width: 100, render: (l?: string) => l ? (
      <span className="flex items-center gap-1">
        {(() => { const Icon = damageLevelMap[l]?.icon; return <Icon className="w-4 h-4" style={{ color: damageLevelMap[l]?.color }} />; })()}
        <span style={{ color: damageLevelMap[l]?.color }}>{damageLevelMap[l]?.text}</span>
      </span>
    ) : '-' },
    { title: '修复措施', dataIndex: 'repairMeasures', ellipsis: true },
    { title: '状态', dataIndex: 'status', width: 90, render: (s: string) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text}</Tag> },
  ];

  return (
    <div className="p-6 space-y-6">
      <Card title="网箱检查状态" className="rounded-xl shadow-sm border-0" styles={cardStyle}
        extra={<Button type="primary" icon={<Plus size={16} />} onClick={() => openModal()}>新增检查</Button>}>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {cageStatuses.map(cage => (
            <div key={cage.id} onClick={() => openModal(cage.id)}
              className={`p-3 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                cage.status === 'issue_found' ? 'border-red-400 bg-red-50' :
                cage.status === 'normal' ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'
              }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold truncate">{cage.name}</span>
                {cage.damageLevel && <AlertTriangle className="w-4 h-4" style={{ color: damageLevelMap[cage.damageLevel]?.color }} />}
                {cage.status === 'normal' && !cage.damageLevel && <ShieldCheck className="w-4 h-4 text-green-500" />}
                {cage.status === 'pending' && <Clock className="w-4 h-4 text-gray-400" />}
              </div>
              <p className="text-xs text-gray-500">{cage.lastCheck ? `${cage.daysSinceCheck}天前` : '未检查'}</p>
              <Tag color={statusMap[cage.status]?.color} className="mt-1" style={{ fontSize: '10px', padding: '0 4px' }}>
                {statusMap[cage.status]?.text}
              </Tag>
            </div>
          ))}
        </div>
      </Card>

      <Card title="破损记录" className="rounded-xl shadow-sm border-0" styles={cardStyle}>
        <Table<Inspection> dataSource={netChecks.slice(0, 10)} columns={columns} rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false }} size="middle" />
      </Card>

      <Row gutter={16}>
        <Col xs={24} lg={10}>
          <Card title="按破损程度统计" className="rounded-xl shadow-sm border-0" styles={cardStyle}>
            <div style={chartStyle}>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={damageByLevel} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                    paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {damageByLevel.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card title="按网箱统计" className="rounded-xl shadow-sm border-0" styles={cardStyle}>
            <div style={chartStyle}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={damageByCage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" tick={{ fill: '#999', fontSize: 10 }} stroke="#555" />
                  <YAxis tick={{ fill: '#999', fontSize: 11 }} stroke="#555" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="破损次数" fill="#1890FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Modal title={selectedCage ? `新增网衣破损记录 - ${cages.find(c => c.id === selectedCage)?.name}` : '新增网衣破损记录'}
        open={modalVisible} onCancel={() => { setModalVisible(false); setSelectedCage(null); }}
        onOk={handleSubmit} okText="保存记录" width={550}>
        <Form form={form} layout="vertical">
          {!selectedCage && (
            <Form.Item name="cageId" label="选择网箱" rules={[{ required: true }]}>
              <Select placeholder="请选择网箱">
                {cages.filter(c => c.status === 'normal').map(cage => (
                  <Option key={cage.id} value={cage.id}>{cage.name}</Option>
                ))}
              </Select>
            </Form.Item>
          )}
          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item name="location" label="破损位置" rules={[{ required: true }]}>
                <Select placeholder="请选择位置">
                  {formOptions.locations.map(loc => <Option key={loc} value={loc}>{loc}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="size" label="破损大小" rules={[{ required: true }]}>
                <Select placeholder="请选择大小">
                  {formOptions.sizes.map(size => <Option key={size} value={size}>{size}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="damageLevel" label="破损程度" rules={[{ required: true }]}>
            <Select placeholder="请选择程度">
              {formOptions.levels.map(l => <Option key={l.v} value={l.v}>{l.t}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="repairMeasures" label="修复措施" rules={[{ required: true }]}>
            <Select placeholder="请选择修复措施">
              {formOptions.measures.map(m => <Option key={m} value={m}>{m}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item label="上传照片">
            <Upload multiple listType="picture-card" beforeUpload={() => false}>
              <div className="flex flex-col items-center justify-center py-4">
                <Camera className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">点击上传</span>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
