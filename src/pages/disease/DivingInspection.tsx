import { useState, useMemo } from 'react';
import { Card, Table, Tag, Button, Form, Select, Input, DatePicker, Modal, Upload, message, Row, Col } from 'antd';
import { Waves, Plus, Camera, CheckCircle, AlertCircle, Clock, MapPin, Calendar, User } from 'lucide-react';
import dayjs from 'dayjs';
import { useAppStore } from '@/store';
import type { Inspection } from '@/types';

const { Option } = Select;
const { TextArea } = Input;

const statusMap: Record<string, { text: string; color: string }> = {
  normal: { text: '正常', color: 'success' },
  issue_found: { text: '发现问题', color: 'warning' },
  resolved: { text: '已解决', color: 'processing' },
};

export default function DivingInspection() {
  const { inspections, cages, currentUser } = useAppStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const divingInspections = useMemo(() =>
    inspections.filter(i => i.type === 'diving')
      .sort((a, b) => new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime()),
    [inspections]
  );

  const stats = useMemo(() => {
    const thisMonth = divingInspections.filter(i => dayjs(i.inspectionDate).isSame(dayjs(), 'month'));
    const issues = thisMonth.filter(i => i.status !== 'normal');
    const resolved = thisMonth.filter(i => i.status === 'resolved');
    return { total: thisMonth.length, issues: issues.length, resolved: resolved.length };
  }, [divingInspections]);

  const plannedTasks = useMemo(() => {
    const futureDates = [1, 3, 5, 7].map(d => dayjs().add(d, 'day'));
    const divers = ['潜水员甲', '潜水员乙', '潜水员丙'];
    return futureDates.map((date, idx) => ({
      id: `plan-${idx}`,
      cageId: cages[idx % cages.length].id,
      plannedDate: date.format('YYYY-MM-DD'),
      diver: divers[idx % divers.length],
      status: idx === 0 ? 'pending' : 'scheduled',
    }));
  }, [cages]);

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const newRecord: Inspection = {
        id: `inspect-${Date.now()}`,
        cageId: values.cageId,
        type: 'diving',
        inspectionDate: values.inspectionDate.format('YYYY-MM-DD'),
        inspector: values.inspector,
        findings: values.findings,
        photos: [],
        status: values.status,
        repairMeasures: values.repairMeasures,
      };
      message.success('巡查记录已保存');
      setModalVisible(false);
      form.resetFields();
      console.log('New diving inspection:', newRecord);
    });
  };

  const columns = [
    { title: '日期', dataIndex: 'inspectionDate', width: 110, render: (d: string) => <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{d}</span> },
    { title: '网箱', dataIndex: 'cageId', render: (id: string) => <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{cages.find(c => c.id === id)?.name || id}</span> },
    { title: '潜水员', dataIndex: 'inspector', render: (n: string) => <span className="flex items-center gap-1"><User className="w-3 h-3" />{n}</span> },
    { title: '检查结果', dataIndex: 'findings', ellipsis: true },
    { title: '状态', dataIndex: 'status', width: 100, render: (s: string) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text}</Tag> },
    { title: '操作', width: 120, render: (_: unknown, r: Inspection) => (
      <div className="flex gap-2">
        <Button type="link" size="small">查看</Button>
        {r.status === 'issue_found' && <Button type="link" size="small" onClick={() => message.info('处理问题')}>处理</Button>}
      </div>
    ) },
  ];

  const statCards = [
    { title: '本月巡查次数', value: stats.total, icon: Calendar, color: '#1890FF', gradient: 'from-blue-500 to-cyan-400' },
    { title: '发现问题数', value: stats.issues, icon: AlertCircle, color: '#FAAD14', gradient: 'from-orange-500 to-amber-400' },
    { title: '已解决数', value: stats.resolved, icon: CheckCircle, color: '#52C41A', gradient: 'from-green-500 to-emerald-400' },
  ];

  const cardStyle = { header: { padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }, body: { padding: '16px 20px' } };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border-0 overflow-hidden">
              <div className="relative p-4">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient}`} />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                    <p className="text-3xl font-bold" style={{ color: card.color }}>{card.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center opacity-90`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={8}>
          <Card title="巡查计划" className="rounded-xl shadow-sm border-0" styles={cardStyle}>
            <div className="space-y-3">
              {plannedTasks.map(task => (
                <div key={task.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{cages.find(c => c.id === task.cageId)?.name}</span>
                    <Tag color={task.status === 'pending' ? 'processing' : 'default'}>
                      {task.status === 'pending' ? '待执行' : '已排期'}
                    </Tag>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{task.plannedDate}</div>
                    <div className="flex items-center gap-1"><User className="w-3 h-3" />{task.diver}</div>
                  </div>
                  {task.status === 'pending' && (
                    <Button type="primary" size="small" block className="mt-2" onClick={() => setModalVisible(true)}>
                      开始巡查
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="巡查记录" className="rounded-xl shadow-sm border-0" styles={cardStyle}
            extra={<Button type="primary" icon={<Plus size={16} />} onClick={() => setModalVisible(true)}>新增记录</Button>}>
            <Table<Inspection>
              dataSource={divingInspections.slice(0, 8)}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 8, showSizeChanger: false }}
              size="middle"
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="新增潜水巡查记录"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        okText="保存记录"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item name="cageId" label="网箱" rules={[{ required: true }]}>
                <Select placeholder="请选择网箱">
                  {cages.filter(c => c.status === 'normal').map(cage => (
                    <Option key={cage.id} value={cage.id}>{cage.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="inspectionDate" label="巡查日期" rules={[{ required: true }]} initialValue={dayjs()}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item name="inspector" label="潜水员" rules={[{ required: true }]} initialValue={currentUser.name}>
                <Select placeholder="请选择潜水员">
                  <Option value="潜水员甲">潜水员甲</Option>
                  <Option value="潜水员乙">潜水员乙</Option>
                  <Option value="潜水员丙">潜水员丙</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="status" label="状态" rules={[{ required: true }]} initialValue="normal">
                <Select placeholder="请选择状态">
                  <Option value="normal">正常</Option>
                  <Option value="issue_found">发现问题</Option>
                  <Option value="resolved">已解决</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="findings" label="检查结果" rules={[{ required: true }]}>
            <TextArea rows={3} placeholder="请详细描述巡查发现的情况..." />
          </Form.Item>
          <Form.Item name="repairMeasures" label="修复措施（如有）">
            <TextArea rows={2} placeholder="请描述采取的修复措施..." />
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
