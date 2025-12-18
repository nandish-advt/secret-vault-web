import React, { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  Space,
  Button,
  Tag,
  message,
  Alert,
  Typography,
  Tooltip,
  Popconfirm,
  Descriptions,
} from 'antd';
import {
  HistoryOutlined,
  EyeOutlined,
  RollbackOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { secretsApi, getCurrentEnvironment } from '../services/api';
import './SecretVersionHistory.css';

const { Text, Paragraph } = Typography;

const SecretVersionHistory = ({ visible, secretName, onClose, onRestore }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewingVersion, setViewingVersion] = useState(null);
  const [viewDrawerVisible, setViewDrawerVisible] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (visible && secretName) {
      loadVersions();
    }
  }, [visible, secretName]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      const currentEnv = getCurrentEnvironment();
      const data = await secretsApi.getSecretVersions(secretName, currentEnv);
      setVersions(data.versions || []);
    } catch (err) {
      message.error(`Failed to load versions: ${err.response?.data?.message || err.message}`);
      console.error('Error loading versions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewVersion = async (version) => {
    try {
      message.loading({ content: 'Loading version...', key: 'viewVersion' });
      const currentEnv = getCurrentEnvironment();
      const data = await secretsApi.getSecretVersion(secretName, version, currentEnv);
      setViewingVersion(data);
      setViewDrawerVisible(true);
      message.destroy('viewVersion');
    } catch (err) {
      message.destroy('viewVersion');
      message.error('Failed to load version details');
      console.error('Error loading version:', err);
    }
  };

  const handleRestoreVersion = async (version) => {
    try {
      setRestoring(true);
      const currentEnv = getCurrentEnvironment();
      const result = await secretsApi.restoreSecretVersion(secretName, version, currentEnv);

      message.success(`Version restored! New version: ${result.newVersion}`);

      await loadVersions();

      if (onRestore) {
        onRestore(secretName);
      }
    } catch (err) {
      message.error(`Failed to restore: ${err.response?.data?.message || err.message}`);
      console.error('Error restoring version:', err);
    } finally {
      setRestoring(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getVersionAge = (createdOn) => {
    if (!createdOn) return '';
    const now = new Date();
    const created = new Date(createdOn);
    const diffMs = now - created;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const columns = [
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      width: 120,
      render: (version, record, index) => (
        <Space direction="vertical" size="small">
          <Text code style={{ fontSize: '11px' }}>
            {version.substring(0, 8)}...
          </Text>
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
      width: 80,
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
              onClick={() => handleViewVersion(record.version)}
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
              onConfirm={() => handleRestoreVersion(record.version)}
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
    <>
      <Modal
        title={
          <Space>
            <HistoryOutlined />
            <span>Version History</span>
            <Text code>{secretName}</Text>
          </Space>
        }
        open={visible}
        onCancel={onClose}
        width={1000}
        footer={[
          <Button key="close" onClick={onClose}>
            Close
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Alert
            message="Version History"
            description={
              <div>
                <p>Azure Key Vault maintains all versions of secrets automatically.</p>
                <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
                  <li>Each update creates a new version</li>
                  <li>Old versions remain accessible</li>
                  <li>Restore any previous version to create a new current version</li>
                  <li>Version restoration creates a new version (non-destructive)</li>
                </ul>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />

          <Table
            columns={columns}
            dataSource={versions}
            loading={loading}
            rowKey="version"
            pagination={{ pageSize: 10 }}
            size="small"
          />
        </Space>
      </Modal>

      {/* Version Detail Modal */}
      <Modal
        title={
          <Space>
            <ClockCircleOutlined />
            <span>Version Details</span>
          </Space>
        }
        open={viewDrawerVisible}
        onCancel={() => {
          setViewDrawerVisible(false);
          setViewingVersion(null);
        }}
        width={600}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setViewDrawerVisible(false);
              setViewingVersion(null);
            }}
          >
            Close
          </Button>,
        ]}
      >
        {viewingVersion && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Secret Name">
                <Text code>{viewingVersion.name}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Version">
                <Text code style={{ fontSize: '11px' }}>
                  {viewingVersion.version}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label="Status">
                {viewingVersion.enabled ? (
                  <Tag icon={<CheckCircleOutlined />} color="success">
                    Enabled
                  </Tag>
                ) : (
                  <Tag icon={<CloseCircleOutlined />} color="error">
                    Disabled
                  </Tag>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Value">
                <Paragraph
                  code
                  copyable
                  style={{
                    marginBottom: 0,
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                    maxHeight: '200px',
                    overflowY: 'auto',
                  }}
                >
                  {viewingVersion.value}
                </Paragraph>
              </Descriptions.Item>

              <Descriptions.Item label="Created">
                {formatDate(viewingVersion.createdOn)}
              </Descriptions.Item>

              <Descriptions.Item label="Updated">
                {formatDate(viewingVersion.updatedOn)}
              </Descriptions.Item>

              {viewingVersion.expiresOn && (
                <Descriptions.Item label="Expires">
                  {formatDate(viewingVersion.expiresOn)}
                </Descriptions.Item>
              )}

              {viewingVersion.contentType && (
                <Descriptions.Item label="Content Type">
                  <Tag>{viewingVersion.contentType}</Tag>
                </Descriptions.Item>
              )}

              {viewingVersion.tags && Object.keys(viewingVersion.tags).length > 0 && (
                <Descriptions.Item label="Tags">
                  <Space wrap>
                    {Object.entries(viewingVersion.tags).map(([key, value]) => (
                      <Tag key={key}>
                        {key}: {value}
                      </Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Alert
              message="Version Information"
              description="This is a historical version. To make it current, click 'Restore' in the version history table."
              type="info"
              showIcon
            />
          </Space>
        )}
      </Modal>
    </>
  );
};

export default SecretVersionHistory;
