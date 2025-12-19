import React from 'react';
import { Card, Table, Tag, Space, Button, Checkbox, Tooltip } from 'antd';
import {
  EyeOutlined,
  DownloadOutlined,
  CodeOutlined,
  EditOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { Input } from 'antd';

const { Search } = Input;

const ComparisonTable = ({
  tableData,
  selectedSecrets,
  searchTerm,
  copying,
  onSearchChange,
  onSelectAll,
  onDeselectAll,
  onSecretSelect,
  onExport,
  onGenerateCli,
  onEditAndCopy,
  onDirectCopy,
  onPreview,
}) => {
  const columns = [
    {
      title: 'Select',
      key: 'select',
      width: 60,
      render: (_, record) => (
        <Checkbox
          checked={selectedSecrets.includes(record.name)}
          onChange={(e) => onSecretSelect(record.name, e.target.checked)}
          disabled={record.status === 'onlyInTarget'}
        />
      ),
    },
    {
      title: 'Secret Name',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <code>{name}</code>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => {
        if (status === 'onlyInSource') {
          return <Tag color="blue">Only in Source</Tag>;
        } else if (status === 'onlyInTarget') {
          return <Tag color="orange">Only in Target</Tag>;
        } else {
          return <Tag color="green">In Both</Tag>;
        }
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) =>
        record.status !== 'onlyInTarget' && (
          <Space>
            <Tooltip title="Preview secret value">
              <Button size="small" icon={<EyeOutlined />} onClick={() => onPreview(record.name)} />
            </Tooltip>
          </Space>
        ),
    },
  ];

  return (
    <Card
      size="small"
      title="Detailed Comparison"
      extra={
        <Space wrap>
          <Search
            placeholder="Search secrets..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
          <Button size="small" onClick={onSelectAll}>
            Select All
          </Button>
          <Button size="small" onClick={onDeselectAll}>
            Deselect All
          </Button>
          <Button icon={<DownloadOutlined />} onClick={onExport} size="small">
            Export
          </Button>
          <Button
            icon={<CodeOutlined />}
            onClick={onGenerateCli}
            size="small"
            type="dashed"
            disabled={selectedSecrets.length === 0}
            style={{ borderColor: '#0078d4', color: '#0078d4' }}
          >
            Azure CLI
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={onEditAndCopy}
            loading={copying}
            disabled={selectedSecrets.length === 0}
            style={{ backgroundColor: '#faad14', borderColor: '#faad14' }}
          >
            Edit & Copy ({selectedSecrets.length})
          </Button>
          <Button
            type="primary"
            icon={<CopyOutlined />}
            onClick={onDirectCopy}
            loading={copying}
            disabled={selectedSecrets.length === 0}
          >
            Copy Selected ({selectedSecrets.length})
          </Button>
        </Space>
      }
    >
      <Table columns={columns} dataSource={tableData} pagination={{ pageSize: 20 }} size="small" />
    </Card>
  );
};

export default ComparisonTable;
