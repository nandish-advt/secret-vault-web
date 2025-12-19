import React from 'react';
import { Table, Space, Button, Tag, Tooltip, Popconfirm, Typography } from 'antd';
import {
  EyeOutlined,
  RollbackOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { formatDate, getVersionAge, truncateVersion } from './utils';

const { Text } = Typography;

const VersionHistoryTable = ({ versions, loading, restoring, onView, onRestore }) => {
  const columns = [
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      width: 120,
      render: (version, record, index) => (
        <Space direction="vertical" size="small">
          <Tooltip title={version}>
            <Text code style={{ fontSize: '11px' }}>
              {truncateVersion(version)}
            </Text>
          </Tooltip>
          {index === 0 && (
            <Tag color="green" style={{ fontSize: '10px' }}>
              CURRENT
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 100,
      render: (enabled) =>
        enabled ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Enabled
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="error">
            Disabled
          </Tag>
        ),
    },
    {
      title: 'Created',
      dataIndex: 'createdOn',
      key: 'createdOn',
      width: 200,
      render: (createdOn) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: '13px' }}>{formatDate(createdOn)}</Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {getVersionAge(createdOn)}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Updated',
      dataIndex: 'updatedOn',
      key: 'updatedOn',
      width: 180,
      render: (updatedOn) => <Text style={{ fontSize: '13px' }}>{formatDate(updatedOn)}</Text>,
    },
    {
      title: 'Expires',
      dataIndex: 'expiresOn',
      key: 'expiresOn',
      width: 120,
      render: (expiresOn) =>
        expiresOn ? (
          <Tooltip title={formatDate(expiresOn)}>
            <Tag color="orange">Has Expiry</Tag>
          </Tooltip>
        ) : (
          <Tag color="default">No Expiry</Tag>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record, index) => (
        <Space>
          <Tooltip title="View version details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onView(record.version)}
            />
          </Tooltip>

          {index !== 0 && (
            <Popconfirm
              title="Restore this version?"
              description={
                <div>
                  <p>This will create a new version with this content.</p>
                  <p>
                    <strong>Current version will be preserved.</strong>
                  </p>
                </div>
              }
              onConfirm={() => onRestore(record.version)}
              okText="Restore"
              cancelText="Cancel"
            >
              <Tooltip title="Restore this version">
                <Button type="text" size="small" icon={<RollbackOutlined />} loading={restoring} />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={versions}
      loading={loading}
      rowKey="version"
      pagination={{ pageSize: 10 }}
      size="small"
    />
  );
};

export default VersionHistoryTable;
