import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Button, Alert, Spin, Space, message, Typography, Tooltip, Modal } from 'antd';
import { KeyOutlined, EyeOutlined, EyeInvisibleOutlined, CopyOutlined, CloseOutlined, ReloadOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { secretsApi, getCurrentEnvironment } from '../services/api';
import './SecretDetail.css';

const { Text, Paragraph } = Typography;
const { confirm } = Modal;

const SecretDetail = ({ secretName, onClose, onDelete }) => {
  const [secret, setSecret] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showValue, setShowValue] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (secretName) {
      loadSecret();
    }
  }, [secretName]);

  const loadSecret = async () => {
    try {
      setLoading(true);
      setError(null);
      const currentEnv = getCurrentEnvironment();
      const data = await secretsApi.getSecret(secretName, currentEnv);
      setSecret(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (secret?.value) {
      navigator.clipboard.writeText(secret.value);
      message.success('Secret value copied to clipboard!');
    }
  };

  const handleDelete = () => {
    confirm({
      title: 'Delete Secret',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Are you sure you want to delete <strong>"{secretName}"</strong>?</p>
          <Alert
            message="Soft Delete"
            description="This will soft-delete the secret. It can be recovered within the Azure Key Vault retention period (typically 90 days)."
            type="info"
            showIcon
            style={{ marginTop: '12px' }}
          />
        </div>
      ),
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setDeleting(true);
          const currentEnv = getCurrentEnvironment();
          await secretsApi.deleteSecret(secretName, currentEnv);
          message.success(`Secret "${secretName}" deleted successfully`);
          
          if (onDelete) {
            onDelete(secretName);
          }
          
          if (onClose) {
            onClose();
          }
        } catch (err) {
          message.error(`Failed to delete secret: ${err.response?.data?.message || err.message}`);
          console.error('Error deleting secret:', err);
        } finally {
          setDeleting(false);
        }
      },
    });
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
    });
  };

  if (!secretName) {
    return (
      <Card className="secret-detail-card empty">
        <div className="empty-state">
          <KeyOutlined className="empty-icon" />
          <h3>Select a Secret</h3>
          <p>Choose a secret from the list to view its details</p>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="secret-detail-card">
        <div className="loading-container">
          <Spin size="large" tip="Loading secret details..." />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        className="secret-detail-card"
        title={
          <Space>
            <KeyOutlined />
            <span>Secret Details</span>
          </Space>
        }
        extra={onClose && <Button type="text" icon={<CloseOutlined />} onClick={onClose} />}
      >
        <Alert
          message="Error Loading Secret"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" danger onClick={loadSecret}>
              Retry
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <Card
      className="secret-detail-card"
      title={
        <Space>
          <KeyOutlined />
          <span>Secret Details</span>
        </Space>
      }
      extra={
        <Space>
          <Tooltip title="Delete Secret">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              loading={deleting}
            />
          </Tooltip>
          <Tooltip title="Refresh">
            <Button type="text" icon={<ReloadOutlined />} onClick={loadSecret} />
          </Tooltip>
          {onClose && (
            <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
          )}
        </Space>
      }
    >
      <Descriptions bordered column={1} size="middle">
        <Descriptions.Item label="Name">
          <Text code copyable style={{ fontFamily: 'monospace' }}>
            {secret?.name}
          </Text>
        </Descriptions.Item>

        <Descriptions.Item label="Value">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div className="secret-value-container">
              {showValue ? (
                <Paragraph
                  code
                  copyable
                  style={{
                    marginBottom: 0,
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                  }}
                >
                  {secret?.value}
                </Paragraph>
              ) : (
                <Text type="secondary" style={{ fontSize: '18px', letterSpacing: '2px' }}>
                  ••••••••••••••••
                </Text>
              )}
            </div>
            <Space>
              <Button
                type="default"
                icon={showValue ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                onClick={() => setShowValue(!showValue)}
                size="small"
              >
                {showValue ? 'Hide' : 'Show'}
              </Button>
              <Button
                type="primary"
                icon={<CopyOutlined />}
                onClick={handleCopy}
                size="small"
              >
                Copy Value
              </Button>
            </Space>
          </Space>
        </Descriptions.Item>

        <Descriptions.Item label="Last Updated">
          <Text>{formatDate(secret?.updatedOn)}</Text>
        </Descriptions.Item>
      </Descriptions>

      <Alert
        message="Security Warning"
        description="Make sure you're in a secure location before revealing secret values. Never share secrets through insecure channels."
        type="warning"
        showIcon
        style={{ marginTop: '20px' }}
      />
    </Card>
  );
};

export default SecretDetail;