import React, { useState, useEffect } from 'react';
import {
  Card,
  Input,
  List,
  Empty,
  Spin,
  Alert,
  Button,
  Badge,
  Popconfirm,
  message,
  Space,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  KeyOutlined,
  CheckCircleFilled,
  DeleteOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { secretsApi, getCurrentEnvironment } from '../services/api';
import SecretVersionHistory from './SecretVersionHistory';
import './SecretList.css';

const { Search } = Input;

const SecretList = ({ onSelectSecret, selectedSecret, refreshTrigger, onDelete }) => {
  const [secrets, setSecrets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingSecret, setDeletingSecret] = useState(null);

  const [versionHistoryVisible, setVersionHistoryVisible] = useState(false);
  const [selectedSecretForHistory, setSelectedSecretForHistory] = useState(null);

  useEffect(() => {
    loadSecrets();
  }, [refreshTrigger]);

  const loadSecrets = async () => {
    try {
      setLoading(true);
      setError(null);
      const currentEnv = getCurrentEnvironment();
      const data = await secretsApi.getAllSecrets(currentEnv);
      setSecrets(data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error('Error loading secrets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (secretName, e) => {
    e.stopPropagation();

    try {
      setDeletingSecret(secretName);
      const currentEnv = getCurrentEnvironment();
      await secretsApi.deleteSecret(secretName, currentEnv);

      message.success(`Secret "${secretName}" deleted successfully`);

      if (selectedSecret === secretName) {
        onSelectSecret(null);
      }

      if (onDelete) {
        onDelete(secretName);
      }

      await loadSecrets();
    } catch (err) {
      message.error(`Failed to delete secret: ${err.response?.data?.message || err.message}`);
      console.error('Error deleting secret:', err);
    } finally {
      setDeletingSecret(null);
    }
  };

  const filteredSecrets = secrets.filter((secret) =>
    secret.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add handler for version history
  const handleShowHistory = (secretName, e) => {
    e.stopPropagation();
    setSelectedSecretForHistory(secretName);
    setVersionHistoryVisible(true);
  };

  const handleVersionRestore = (secretName) => {
    // Refresh list after restore
    loadSecrets();
    // If this secret is selected, refresh its details
    if (selectedSecret === secretName) {
      onSelectSecret(secretName);
    }
  };

  return (
    <>
      <Card
        className="secret-list-card"
        title={
          <div className="card-title">
            <span>
              <KeyOutlined /> Secrets
              <Badge
                count={filteredSecrets.length}
                style={{ marginLeft: '12px', backgroundColor: '#52c41a' }}
              />
            </span>
          </div>
        }
        extra={
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={loadSecrets}
            loading={loading}
            title="Refresh"
          />
        }
      >
        <Search
          placeholder="Search secrets..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginBottom: '16px' }}
          allowClear
        />

        {loading ? (
          <div className="loading-container">
            <Spin size="large" tip="Loading secrets..." />
          </div>
        ) : error ? (
          <Alert
            message="Error Loading Secrets"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" danger onClick={loadSecrets}>
                Retry
              </Button>
            }
          />
        ) : filteredSecrets.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={searchTerm ? 'No secrets match your search' : 'No secrets found'}
          />
        ) : (
          <List
            className="secret-list"
            dataSource={filteredSecrets}
            renderItem={(secret) => (
              <List.Item
                className={`secret-item ${selectedSecret === secret ? 'selected' : ''}`}
                onClick={() => onSelectSecret(secret)}
              >
                <div className="secret-item-content">
                  <KeyOutlined className="secret-icon" />
                  <span className="secret-name">{secret}</span>
                  <Space className="secret-actions">
                    {selectedSecret === secret && <CheckCircleFilled className="selected-icon" />}

                    {/* Add History Button */}
                    <Button
                      type="text"
                      size="small"
                      icon={<HistoryOutlined />}
                      onClick={(e) => handleShowHistory(secret, e)}
                      className="history-button"
                      title="Version history"
                    />

                    <Popconfirm
                      title="Delete Secret"
                      description={
                        <div>
                          <p>Are you sure you want to delete "{secret}"?</p>
                          <p style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '8px' }}>
                            This will soft-delete the secret. It can be recovered within the
                            retention period.
                          </p>
                        </div>
                      }
                      onConfirm={(e) => handleDelete(secret, e)}
                      onCancel={(e) => e.stopPropagation()}
                      okText="Delete"
                      cancelText="Cancel"
                      okButtonProps={{ danger: true }}
                      placement="topRight"
                    >
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        loading={deletingSecret === secret}
                        onClick={(e) => e.stopPropagation()}
                        className="delete-button"
                      />
                    </Popconfirm>
                  </Space>
                </div>
              </List.Item>
            )}
          />
        )}
      </Card>

      {/*Add Version History Modal */}
      <SecretVersionHistory
        visible={versionHistoryVisible}
        secretName={selectedSecretForHistory}
        onClose={() => {
          setVersionHistoryVisible(false);
          setSelectedSecretForHistory(null);
        }}
        onRestore={handleVersionRestore}
      />
    </>
  );
};

export default SecretList;
