import { useState, useMemo } from 'react';
import { Card, Calendar, Table, Select, Button, Form, Modal, Switch, Tag, Space, InputNumber, DatePicker, message } from 'antd';
import { Calendar as CalendarIcon, Plus, Clock, CheckCircle, PauseCircle } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import { useAppStore } from '@/store';
import type { FeedingSchedule } from '@/types';

const PRIMARY_COLOR = '#0E4D7A';
const ACCENT_COLOR = '#20B2AA';
const { RangePicker } = DatePicker;
const { Option } = Select;

const scheduleStatusMap = {
  active: { text: '启用中', color: 'success', icon: CheckCircle },
  paused: { text: '已暂停', color: 'warning', icon: PauseCircle },
  completed: { text: '已完成', color: 'default', icon: CheckCircle },
};

const feedTypes = ['配合饲料', '高蛋白饲料', '专用配合饲料', '鲜杂鱼'];
const timeOptions = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];

export default function FeedingSchedulePage() {
  const { feedingSchedules, cages, getCageById } = useAppStore();
  const [cageFilter, setCageFilter] = useState<string>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [schedules, setSchedules] = useState<FeedingSchedule[]>(feedingSchedules);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  const filteredSchedules = useMemo(() => {
    let result = [...schedules];
    if (cageFilter !== 'all') {
      result = result.filter(s => s.cageId === cageFilter);
    }
    return result.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [schedules, cageFilter]);

  const dateCellRender = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const daySchedules = schedules.filter(s => {
      const start = dayjs(s.startDate);
      const end = dayjs(s.endDate);
      return value.isAfter(start.subtract(1, 'day')) && value.isBefore(end.add(1, 'day')) && s.status !== 'completed';
    });

    if (daySchedules.length > 0) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white" style={{ backgroundColor: ACCENT_COLOR }}>
            {value.date()}
          </div>
          {daySchedules.length > 0 && (
            <div className="mt-1 flex gap-0.5">
              {daySchedules.slice(0, 3).map((_, idx) => (
                <span key={idx} className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              ))}
            </div>
          )}
        </div>
      );
    }
    return <div className="text-gray-600">{value.date()}</div>;
  };

  const dateFullCellRender = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const daySchedules = schedules.filter(s => {
      const start = dayjs(s.startDate);
      const end = dayjs(s.endDate);
      return value.isAfter(start.subtract(1, 'day')) && value.isBefore(end.add(1, 'day')) && s.status !== 'completed';
    });

    return (
      <div className={`w-full h-full p-1 ${daySchedules.length > 0 ? 'bg-cyan-50' : ''}`}>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${daySchedules.length > 0 ? 'text-cyan-700' : 'text-gray-600'}`}>{value.date()}</span>
          {daySchedules.length > 0 && <Tag color="cyan" className="text-xs px-1 py-0">{daySchedules.length}个</Tag>}
        </div>
        <div className="mt-1 space-y-0.5">
          {daySchedules.slice(0, 2).map(s => (
            <div key={s.id} className="text-xs text-gray-500 truncate">
              <span className="inline-block w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: ACCENT_COLOR }} />
              {getCageById(s.cageId)?.name}
            </div>
          ))}
          {daySchedules.length > 2 && <div className="text-xs text-gray-400">+{daySchedules.length - 2} 更多</div>}
        </div>
      </div>
    );
  };

  const handleToggleStatus = (id: string) => {
    setSchedules(prev => prev.map(s => {
      if (s.id === id) {
        const newStatus = s.status === 'active' ? 'paused' : 'active';
        message.success(`投喂计划已${newStatus === 'active' ? '启用' : '暂停'}`);
        return { ...s, status: newStatus };
      }
      return s;
    }));
  };

  const handleAddSchedule = () => {
    form.validateFields().then(values => {
      const [startDate, endDate] = values.dateRange;
      const newSchedule: FeedingSchedule = {
        id: `schedule-${String(Date.now()).slice(-6)}`,
        cageId: values.cageId,
        feedType: values.feedType,
        dailyAmount: Number(values.dailyAmount.toFixed(2)),
        feedingTimes: values.feedingTimes,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        status: 'active',
      };
      setSchedules(prev => [...prev, newSchedule]);
      message.success('投喂计划创建成功');
      setModalVisible(false);
      form.resetFields();
    });
  };

  const columns = [
    { title: '网箱', dataIndex: 'cageId', key: 'cageId', render: (id: string) => getCageById(id)?.name || id, width: 120 },
    { title: '饲料类型', dataIndex: 'feedType', key: 'feedType', width: 120 },
    { title: '日投喂量', dataIndex: 'dailyAmount', key: 'dailyAmount', render: (v: number) => `${v} kg`, width: 100 },
    { title: '投喂时间', dataIndex: 'feedingTimes', key: 'feedingTimes', render: (times: string[]) => <Space wrap>{times.map(t => <Tag key={t} color="blue" icon={<Clock size={10} />}>{t}</Tag>)}</Space>, width: 240 },
    { title: '开始日期', dataIndex: 'startDate', key: 'startDate', width: 110 },
    { title: '结束日期', dataIndex: 'endDate', key: 'endDate', width: 110 },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s: keyof typeof scheduleStatusMap) => { const { text, color } = scheduleStatusMap[s]; return <Tag color={color}>{text}</Tag>; }, width: 100 },
    { title: '操作', key: 'action', width: 100, render: (_: unknown, record: FeedingSchedule) => (
      <Switch checked={record.status === 'active'} onChange={() => handleToggleStatus(record.id)} disabled={record.status === 'completed'} />
    )},
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold" style={{ color: PRIMARY_COLOR }}>投喂排期</h1>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => setModalVisible(true)}>
          新增投喂计划
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title={<span className="flex items-center gap-2"><CalendarIcon size={18} style={{ color: ACCENT_COLOR }} />日历视图</span>} className="rounded-xl shadow-sm border-0 lg:col-span-1">
          <Calendar
            cellRender={dateCellRender}
            fullCellRender={dateFullCellRender}
            value={selectedDate}
            onChange={setSelectedDate}
            headerRender={({ value, onChange }) => (
              <div className="flex items-center justify-center gap-2 py-2">
                <Button size="small" onClick={() => onChange(value.subtract(1, 'month'))}>上个月</Button>
                <span className="font-medium" style={{ color: PRIMARY_COLOR }}>{value.format('YYYY年MM月')}</span>
                <Button size="small" onClick={() => onChange(value.add(1, 'month'))}>下个月</Button>
              </div>
            )}
          />
        </Card>

        <Card title={<span className="flex items-center gap-2"><CalendarIcon size={18} style={{ color: ACCENT_COLOR }} />投喂计划列表</span>} className="rounded-xl shadow-sm border-0 lg:col-span-2">
          <div className="mb-4 flex items-center gap-4">
            <span className="text-sm text-gray-500">按网箱筛选：</span>
            <Select
              value={cageFilter}
              onChange={setCageFilter}
              style={{ width: 200 }}
              allowClear
              options={[
                { value: 'all', label: '全部网箱' },
                ...cages.map(c => ({ value: c.id, label: c.name })),
              ]}
            />
            <span className="text-sm text-gray-400">共 {filteredSchedules.length} 条计划</span>
          </div>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredSchedules}
            pagination={{ pageSize: 6, showSizeChanger: false, showTotal: (total) => `共 ${total} 条` }}
            size="small"
            scroll={{ y: 420 }}
          />
        </Card>
      </div>

      <Modal
        title={<span className="flex items-center gap-2"><Plus size={18} style={{ color: ACCENT_COLOR }} />新增投喂计划</span>}
        open={modalVisible}
        onOk={handleAddSchedule}
        onCancel={() => { setModalVisible(false); form.resetFields(); }}
        okText="创建计划"
        cancelText="取消"
        width={560}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="cageId" label="选择网箱" rules={[{ required: true, message: '请选择网箱' }]}>
              <Select placeholder="请选择投喂网箱">
                {cages.filter(c => c.status === 'normal').map(c => (
                  <Option key={c.id} value={c.id}>{c.name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="feedType" label="饲料类型" rules={[{ required: true, message: '请选择饲料类型' }]}>
              <Select placeholder="请选择饲料类型">
                {feedTypes.map(type => (
                  <Option key={type} value={type}>{type}</Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <Form.Item name="dailyAmount" label="日投喂量 (kg)" rules={[{ required: true, message: '请输入日投喂量' }]}>
            <InputNumber min={1} max={500} step={0.5} placeholder="请输入日投喂量" className="w-full" />
          </Form.Item>
          <Form.Item name="feedingTimes" label="投喂时间（可多选）" rules={[{ required: true, message: '请选择投喂时间' }]}>
            <Select mode="multiple" placeholder="请选择投喂时间" maxTagCount={4}>
              {timeOptions.map(time => (
                <Option key={time} value={time}>{time}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="dateRange" label="开始/结束日期" rules={[{ required: true, message: '请选择日期范围' }]}>
            <RangePicker className="w-full" minDate={dayjs()} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
