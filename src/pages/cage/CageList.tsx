import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Table, Input, Select, Button, Space, Tag, Modal, message, Form, DatePicker, InputNumber } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Search, Plus, Eye, Edit, Trash2, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import type { Cage, CageStatus } from '@/types';
import L from 'leaflet';
import dayjs from 'dayjs';
import 'leaflet/dist/leaflet.css';

const statusColorMap: Record<CageStatus, string> = {
  normal: 'green',
  maintenance: 'blue',
  damaged: 'red',
  idle: 'default',
};

const statusTextMap: Record<CageStatus, string> = {
  normal: '正常',
  maintenance: '维护中',
  damaged: '损坏',
  idle: '闲置',
};

const createCustomIcon = (color: string) => {
  return new L.DivIcon({
    className: 'custom-marker',
    html: `<div style="width: 24px; height: 24px; background: ${color}; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const getMarkerColor = (status: CageStatus): string => {
  const colors: Record<CageStatus, string> = {
    normal: '#52c41a',
    maintenance: '#1890ff',
    damaged: '#f5222d',
    idle: '#bfbfbf',
  };
  return colors[status];
};

const CageList = () => {
  const navigate = useNavigate();
  const { cages, addCage, updateCage, deleteCage } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<CageStatus | undefined>();
  const [sortedInfo, setSortedInfo] = useState<{ field?: string; order?: 'ascend' | 'descend' | null }>({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingCage, setDeletingCage] = useState<Cage | null>(null);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [editingCage, setEditingCage] = useState<Cage | null>(null);
  const [form] = Form.useForm();

  const filteredData = useMemo(() => {
    let result = [...cages];
    if (searchText) {
      result = result.filter(
        (cage) =>
          cage.code.toLowerCase().includes(searchText.toLowerCase()) ||
          cage.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (statusFilter) {
      result = result.filter((cage) => cage.status === statusFilter);
    }
    if (sortedInfo.field && sortedInfo.order) {
      result.sort((a, b) => {
        const aVal = a[sortedInfo.field as keyof Cage];
        const bVal = b[sortedInfo.field as keyof Cage];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortedInfo.order === 'ascend'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortedInfo.order === 'ascend' ? aVal - bVal : bVal - aVal;
        }
        return 0;
      });
    }
    return result;
  }, [cages, searchText, statusFilter, sortedInfo]);

  const handleDelete = (cage: Cage) => {
    setDeletingCage(cage);
    setDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    if (deletingCage) {
      deleteCage(deletingCage.id);
      message.success(`网箱 ${deletingCage.name} 已删除`);
    }
    setDeleteModalVisible(false);
    setDeletingCage(null);
  };

  const openAddModal = () => {
    setEditingCage(null);
    form.resetFields();
    setFormModalVisible(true);
  };

  const openEditModal = (cage: Cage) => {
    setEditingCage(cage);
    form.setFieldsValue({
      code: cage.code,
      name: cage.name,
      latitude: cage.latitude,
      longitude: cage.longitude,
      specification: cage.specification,
      material: cage.material,
      installDate: cage.installDate ? dayjs(cage.installDate) : undefined,
      status: cage.status,
      capacity: cage.capacity,
    });
    setFormModalVisible(true);
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData = {
        ...values,
        installDate: values.installDate ? values.installDate.format('YYYY-MM-DD') : '',
      };

      if (editingCage) {
        updateCage(editingCage.id, formData);
        message.success(`网箱 ${formData.name} 已更新`);
      } else {
        const newCage: Cage = {
          id: `cage-${Date.now()}`,
          ...formData,
          equipment: [],
          currentStock: 0,
        };
        addCage(newCage);
        message.success(`网箱 ${formData.name} 已添加`);
      }

      setFormModalVisible(false);
      setEditingCage(null);
      form.resetFields();
    } catch {}
  };

  const handleFormCancel = () => {
    setFormModalVisible(false);
    setEditingCage(null);
    form.resetFields();
  };

  const columns: ColumnsType<Cage> = [
    {
      title: '网箱编号',
      dataIndex: 'code',
      key: 'code',
      sorter: true,
      sortOrder: sortedInfo.field === 'code' ? sortedInfo.order : null,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      sortOrder: sortedInfo.field === 'name' ? sortedInfo.order : null,
    },
    {
      title: '规格',
      dataIndex: 'specification',
      key: 'specification',
    },
    {
      title: '材质',
      dataIndex: 'material',
      key: 'material',
    },
    {
      title: '安装日期',
      dataIndex: 'installDate',
      key: 'installDate',
      sorter: true,
      sortOrder: sortedInfo.field === 'installDate' ? sortedInfo.order : null,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: CageStatus) => (
        <Tag color={statusColorMap[status]}>{statusTextMap[status]}</Tag>
      ),
    },
    {
      title: '当前存鱼量',
      dataIndex: 'currentStock',
      key: 'currentStock',
      sorter: true,
      sortOrder: sortedInfo.field === 'currentStock' ? sortedInfo.order : null,
      render: (val: number) => val ?? 0,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Cage) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<Eye size={14} />}
            onClick={() => navigate(`/cage/${record.id}`)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<Edit size={14} />}
            onClick={() => openEditModal(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<Trash2 size={14} />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <Space size="middle">
          <Input
            placeholder="搜索网箱编号或名称"
            prefix={<Search size={16} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 280 }}
            allowClear
          />
          <Select
            placeholder="状态筛选"
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            style={{ width: 160 }}
            allowClear
            options={[
              { value: 'normal', label: '正常' },
              { value: 'maintenance', label: '维护中' },
              { value: 'damaged', label: '损坏' },
              { value: 'idle', label: '闲置' },
            ]}
          />
        </Space>
        <Button type="primary" icon={<Plus size={16} />} onClick={openAddModal}>
          新增网箱
        </Button>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        <div style={{ width: '40%' }}>
          <MapContainer
            center={[30.258, 121.989]}
            zoom={13}
            style={{ height: '600px', width: '100%', borderRadius: '8px' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            {filteredData.map((cage) => (
              <Marker
                key={cage.id}
                position={[cage.latitude, cage.longitude]}
                icon={createCustomIcon(getMarkerColor(cage.status))}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-semibold mb-1">{cage.name}</div>
                    <div>编号: {cage.code}</div>
                    <div>
                      状态:{' '}
                      <Tag color={statusColorMap[cage.status]}>
                        {statusTextMap[cage.status]}
                      </Tag>
                    </div>
                    <div>存鱼量: {cage.currentStock ?? 0} 尾</div>
                    <Button
                      type="link"
                      size="small"
                      className="p-0 mt-1"
                      onClick={() => navigate(`/cage/${cage.id}`)}
                    >
                      查看详情
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div style={{ width: '60%' }} className="flex flex-col">
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredData}
            pagination={{
              ...pagination,
              total: filteredData.length,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
              onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
            }}
            onChange={(_, __, sorter) => {
              if (Array.isArray(sorter)) return;
              setSortedInfo({
                field: sorter.field as string,
                order: sorter.order as 'ascend' | 'descend' | null,
              });
            }}
            onRow={(record) => ({
              onClick: () => navigate(`/cage/${record.id}`),
              style: { cursor: 'pointer' },
            })}
            scroll={{ y: 520 }}
          />
        </div>
      </div>

      <Modal
        title={editingCage ? '编辑网箱' : '新增网箱'}
        open={formModalVisible}
        onOk={handleFormSubmit}
        onCancel={handleFormCancel}
        okText={editingCage ? '保存' : '创建'}
        cancelText="取消"
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item label="网箱编号" name="code" rules={[{ required: true, message: '请输入网箱编号' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
            <Input />
          </Form.Item>
          <Space size="middle" style={{ display: 'flex', width: '100%' }}>
            <Form.Item label="纬度" name="latitude" rules={[{ required: true, message: '请输入纬度' }]} style={{ width: '100%' }}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="经度" name="longitude" rules={[{ required: true, message: '请输入经度' }]} style={{ width: '100%' }}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Form.Item label="规格" name="specification" rules={[{ required: true, message: '请输入规格' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="材质" name="material" rules={[{ required: true, message: '请输入材质' }]}>
            <Input />
          </Form.Item>
          <Space size="middle" style={{ display: 'flex', width: '100%' }}>
            <Form.Item label="安装日期" name="installDate" rules={[{ required: true, message: '请选择安装日期' }]} style={{ width: '100%' }}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]} style={{ width: '100%' }}>
              <Select
                options={[
                  { value: 'normal', label: '正常' },
                  { value: 'maintenance', label: '维护中' },
                  { value: 'damaged', label: '损坏' },
                  { value: 'idle', label: '闲置' },
                ]}
              />
            </Form.Item>
          </Space>
          <Form.Item label="容量" name="capacity" rules={[{ required: true, message: '请输入容量' }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="确认删除"
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="确认删除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <p className="flex items-center gap-2">
          <MapPin size={16} className="text-red-500" />
          确定要删除网箱 <span className="font-semibold">{deletingCage?.name}</span> 吗？
        </p>
        <p className="text-gray-500 text-sm mt-2">此操作不可撤销</p>
      </Modal>
    </div>
  );
};

export default CageList;
