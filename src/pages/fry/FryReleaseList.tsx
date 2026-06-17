import { useState, useMemo } from 'react';
import { Table, Input, Select, Button, Space, Card, Modal, Form, DatePicker, InputNumber, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Plus, Search, Fish, Calendar, TrendingUp, Eye, Edit, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store';
import type { FryRelease } from '@/types';
import dayjs from 'dayjs';

const FryReleaseList = () => {
  const { fryReleases, cages, getCageById, addFryRelease, updateFryRelease, deleteFryRelease } = useAppStore();
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<string>();
  const [sortedInfo, setSortedInfo] = useState<{ field?: string; order?: 'ascend' | 'descend' | null }>({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FryRelease | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState<FryRelease | null>(null);

  const speciesOptions = useMemo(
    () => [...new Set(fryReleases.map((f) => f.frySpecies))].map((s) => ({ value: s, label: s })),
    [fryReleases]
  );

  const stats = useMemo(() => {
    const totalBatches = fryReleases.length;
    const totalQuantity = fryReleases.reduce((sum, f) => sum + f.quantity, 0);
    const activeBatches = fryReleases.filter((f) => dayjs(f.releaseDate).add(8, 'month').isAfter(dayjs())).length;
    const avgSurvival = fryReleases.length
      ? fryReleases.reduce((sum, f) => sum + (f.survivalRate || 0), 0) / fryReleases.length
      : 0;
    return { totalBatches, totalQuantity, activeBatches, avgSurvival };
  }, [fryReleases]);

  const filteredData = useMemo(() => {
    let result = [...fryReleases];
    if (searchText) {
      result = result.filter(
        (fry) =>
          fry.batchNo.toLowerCase().includes(searchText.toLowerCase()) ||
          fry.frySpecies.toLowerCase().includes(searchText.toLowerCase()) ||
          fry.supplier.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (speciesFilter) result = result.filter((fry) => fry.frySpecies === speciesFilter);
    if (sortedInfo.field && sortedInfo.order) {
      result.sort((a, b) => {
        const aVal = a[sortedInfo.field as keyof FryRelease];
        const bVal = b[sortedInfo.field as keyof FryRelease];
        if (typeof aVal === 'string') {
          return sortedInfo.order === 'ascend'
            ? aVal.localeCompare(bVal as string)
            : (bVal as string).localeCompare(aVal);
        }
        if (typeof aVal === 'number') {
          return sortedInfo.order === 'ascend' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
        }
        return 0;
      });
    }
    return result;
  }, [fryReleases, searchText, speciesFilter, sortedInfo]);

  const getSurvivalColor = (rate?: number) => {
    if (!rate) return 'default';
    if (rate >= 90) return 'green';
    if (rate >= 80) return 'blue';
    if (rate >= 70) return 'orange';
    return 'red';
  };

  const openModal = (record?: FryRelease) => {
    setEditingRecord(record || null);
    if (record) {
      form.setFieldsValue({
        ...record,
        releaseDate: dayjs(record.releaseDate),
        expectedHarvestDate: record.expectedHarvestDate ? dayjs(record.expectedHarvestDate) : undefined,
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleDelete = (record: FryRelease) => {
    setDeletingRecord(record);
    setDeleteModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        releaseDate: values.releaseDate.format('YYYY-MM-DD'),
        expectedHarvestDate: values.expectedHarvestDate?.format('YYYY-MM-DD'),
      };
      if (editingRecord) {
        updateFryRelease(editingRecord.id, payload);
        message.success(`批次 ${editingRecord.batchNo} 已更新`);
      } else {
        const id = `fry-${Date.now()}`;
        const batchNo = `BN${Date.now().toString().slice(-6)}`;
        addFryRelease({ ...payload, id, batchNo });
        message.success('投放登记已创建');
      }
      setModalVisible(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const confirmDelete = () => {
    deleteFryRelease(deletingRecord!.id);
    setDeleteModalVisible(false);
    setDeletingRecord(null);
    message.success(`批次 ${deletingRecord?.batchNo} 已删除`);
  };

  const statCards = [
    { title: '总投放批次', value: stats.totalBatches, icon: <Fish size={24} />, gradient: 'from-blue-500 to-cyan-400' },
    { title: '总投放数量', value: stats.totalQuantity.toLocaleString() + ' 尾', icon: <TrendingUp size={24} />, gradient: 'from-green-500 to-emerald-400' },
    { title: '当前养殖中', value: stats.activeBatches + ' 批', icon: <Calendar size={24} />, gradient: 'from-orange-500 to-amber-400' },
    { title: '平均存活率', value: stats.avgSurvival.toFixed(1) + '%', icon: <TrendingUp size={24} />, gradient: 'from-purple-500 to-violet-400' },
  ];

  const columns: ColumnsType<FryRelease> = [
    { title: '批次号', dataIndex: 'batchNo', key: 'batchNo', sorter: true, sortOrder: sortedInfo.field === 'batchNo' ? sortedInfo.order : null,
      render: (text: string, record: FryRelease) => <Button type="link" className="p-0 h-auto" onClick={() => openModal(record)}>{text}</Button> },
    { title: '网箱', dataIndex: 'cageId', key: 'cageId', render: (id: string) => getCageById(id)?.name || id },
    { title: '鱼苗品种', dataIndex: 'frySpecies', key: 'frySpecies', sorter: true, sortOrder: sortedInfo.field === 'frySpecies' ? sortedInfo.order : null,
      render: (text: string) => <Tag color="blue">{text}</Tag> },
    { title: '投放数量', dataIndex: 'quantity', key: 'quantity', sorter: true, sortOrder: sortedInfo.field === 'quantity' ? sortedInfo.order : null,
      render: (val: number) => val.toLocaleString() + ' 尾' },
    { title: '投放重量', dataIndex: 'weight', key: 'weight', sorter: true, sortOrder: sortedInfo.field === 'weight' ? sortedInfo.order : null,
      render: (val: number) => Number(val).toFixed(2) + ' kg' },
    { title: '投放日期', dataIndex: 'releaseDate', key: 'releaseDate', sorter: true, sortOrder: sortedInfo.field === 'releaseDate' ? sortedInfo.order : null },
    { title: '供应商', dataIndex: 'supplier', key: 'supplier' },
    { title: '预计收获日期', dataIndex: 'expectedHarvestDate', key: 'expectedHarvestDate' },
    { title: '存活率', dataIndex: 'survivalRate', key: 'survivalRate', sorter: true, sortOrder: sortedInfo.field === 'survivalRate' ? sortedInfo.order : null,
      render: (val?: number) => <Tag color={getSurvivalColor(val)}>{val ? val.toFixed(1) + '%' : '-'}</Tag> },
    { title: '操作', key: 'action',
      render: (_: unknown, record: FryRelease) => (
        <Space size="small">
          <Button type="link" size="small" icon={<Eye size={14} />} onClick={() => openModal(record)}>查看</Button>
          <Button type="link" size="small" icon={<Edit size={14} />} onClick={() => openModal(record)}>编辑</Button>
          <Button type="link" size="small" danger icon={<Trash2 size={14} />} onClick={() => handleDelete(record)}>删除</Button>
        </Space>
      )
    },
  ];

  const formFields = [
    { name: 'cageId', label: '网箱', type: 'select', options: cages.map((c) => ({ value: c.id, label: c.name })) },
    { name: 'frySpecies', label: '鱼苗品种', type: 'input' },
    { name: 'quantity', label: '投放数量（尾）', type: 'number', min: 0 },
    { name: 'weight', label: '投放重量（kg）', type: 'number', min: 0, step: 0.01 },
    { name: 'supplier', label: '供应商', type: 'input' },
    { name: 'releaseDate', label: '投放日期', type: 'date' },
    { name: 'expectedHarvestDate', label: '预计收获日期', type: 'date', full: true },
  ];

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <Space size="middle">
          <Input placeholder="搜索批次号、品种或供应商" prefix={<Search size={16} />} value={searchText}
            onChange={(e) => setSearchText(e.target.value)} style={{ width: 280 }} allowClear />
          <Select placeholder="鱼种筛选" value={speciesFilter} onChange={(val) => setSpeciesFilter(val)}
            style={{ width: 160 }} allowClear options={speciesOptions} />
        </Space>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => openModal()}>新增投放登记</Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        {statCards.map((card, i) => (
          <Card key={i} className={`bg-gradient-to-r ${card.gradient} text-white border-0 shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-80 mb-1">{card.title}</div>
                <div className="text-2xl font-bold">{card.value}</div>
              </div>
              <div className="opacity-70">{card.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex-1 min-h-0">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredData}
          pagination={{ ...pagination, total: filteredData.length, showSizeChanger: true, showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`, onChange: (page, pageSize) => setPagination({ current: page, pageSize }) }}
          onChange={(_, __, sorter) => { if (!Array.isArray(sorter)) setSortedInfo({ field: sorter.field as string, order: sorter.order as 'ascend' | 'descend' | null }); }}
          rowClassName={() => 'hover:bg-blue-50 transition-colors'}
          scroll={{ y: 400 }}
        />
      </div>

      <Modal title={editingRecord ? '编辑投放登记' : '新增投放登记'} open={modalVisible} onOk={handleSubmit}
        onCancel={() => setModalVisible(false)} okText="保存" cancelText="取消" width={600}>
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-2 gap-4">
            {formFields.map((field) => (
              <Form.Item key={field.name} name={field.name} label={field.label} className={field.full ? 'col-span-2' : ''}
                rules={[{ required: field.type !== 'date' || field.name === 'releaseDate', message: `请${field.type === 'select' ? '选择' : '输入'}${field.label}` }]}>
                {field.type === 'select' && <Select placeholder={`请选择${field.label}`} options={field.options} />}
                {field.type === 'input' && <Input placeholder={`请输入${field.label}`} />}
                {field.type === 'number' && <InputNumber placeholder={`请输入${field.label}`} style={{ width: '100%' }} min={field.min} step={field.step} />}
                {field.type === 'date' && <DatePicker placeholder={`请选择${field.label}`} style={{ width: '100%' }} />}
              </Form.Item>
            ))}
          </div>
        </Form>
      </Modal>

      <Modal title="确认删除" open={deleteModalVisible} onOk={confirmDelete} onCancel={() => setDeleteModalVisible(false)}
        okText="确认删除" cancelText="取消" okButtonProps={{ danger: true }}>
        <p className="flex items-center gap-2">
          <Trash2 size={16} className="text-red-500" />
          确定要删除批次 <span className="font-semibold">{deletingRecord?.batchNo}</span> 吗？
        </p>
        <p className="text-gray-500 text-sm mt-2">此操作不可撤销</p>
      </Modal>
    </div>
  );
};

export default FryReleaseList;
