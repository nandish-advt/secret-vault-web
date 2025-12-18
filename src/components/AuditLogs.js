import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Space, Alert, Pagination, Button, Tooltip } from 'antd';
import {
  FileTextOutlined,
  PlusCircleOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  UnorderedListOutlined,
  UserOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { secretsApi } from '../services/api';
import './AuditLogs.css';

const AuditLogs = ({ refreshTrigger }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadLogs();
  }, [page, refreshTrigger]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await secretsApi.getAuditLogs(page, pageSize);
      setLogs(data.data || []);
      setTotalCount(data.totalCount || 0);
    } catch (err) {
      setError(err.message);
      console.error('Error loading audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'CreateSecret':
        return <PlusCircleOutlined />;
      case 'UpdateSecret':
        return <EditOutlined />;
      case 'ReadSecret':
        return <EyeOutlined />;
      case 'DeleteSecret':
        return <DeleteOutlined />;
      case 'ListSecrets':
        return <UnorderedListOutlined />;
      default:
        return <FileTextOutlined />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'CreateSecret':
        return 'success';
      case 'UpdateSecret':
        return 'warning';
      case 'ReadSecret':
        return 'processing';
      case 'DeleteSecret':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 150,
      render: (action) => (
        <Tag icon={getActionIcon(action)} color={getActionColor(action)}>
          {action}
        </Tag>
      ),
    },
    {
      title: 'Secret Name',
      dataIndex: 'secretName',
      key: 'secretName',
      render: (name) => (
        <Space>
          <span style={{ fontSize: '12px' }}>🔑</span>
          <code style={{ fontSize: '13px' }}>{name}</code>
        </Space>
      ),
    },
    {
      title: 'User',
      dataIndex: 'userEmail',
      key: 'userEmail',
      render: (email) => (
        <Space size="small">
          <UserOutlined style={{ color: '#8c8c8c' }} />
          <span style={{ fontSize: '13px' }}>{email}</span>
        </Space>
      ),
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 140,
      render: (ip) => (
        <Space size="small">
          <GlobalOutlined style={{ color: '#8c8c8c' }} />
          <code style={{ fontSize: '12px' }}>{ip}</code>
        </Space>
      ),
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp) => (
        <Tooltip title={new Date(timestamp).toLocaleString()}>
          <Space size="small">
            <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
            <span style={{ fontSize: '12px' }}>
              {new Date(timestamp).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </Space>
        </Tooltip>
      ),
    },
  ];

  return (
    <Card
      className="audit-logs-card"
      title={
        <Space>
          <FileTextOutlined />
          <span>Audit Logs</span>
          <Tag color="blue">{totalCount} activities</Tag>
        </Space>
      }
      extra={
        <Button
          type="text"
          icon={<ReloadOutlined />}
          onClick={loadLogs}
          loading={loading}
          title="Refresh"
        />
      }
    >
      {error && (
        <Alert
          message="Error Loading Audit Logs"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: '16px' }}
          action={
            <Button size="small" danger onClick={loadLogs}>
              Retry
            </Button>
          }
        />
      )}

      <Table
        columns={columns}
        dataSource={logs}
        loading={loading}
        pagination={false}
        rowKey="id"
        size="middle"
        className="audit-table"
      />

      {totalCount > pageSize && (
        <div className="pagination-container">
          <Pagination
            current={page}
            total={totalCount}
            pageSize={pageSize}
            onChange={(newPage) => setPage(newPage)}
            showSizeChanger={false}
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} activities`}
          />
        </div>
      )}
    </Card>
  );
};

export default AuditLogs;