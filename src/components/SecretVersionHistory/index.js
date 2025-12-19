import React, { useState, useEffect } from 'react';
import { Modal, Space, Alert, message, Typography, Button } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import { secretsApi, getCurrentEnvironment } from '../../services/api';
import VersionHistoryTable from './VersionHistoryTable';
import VersionDetailModal from './VersionDetailModal';
import './styles.css';

const { Text } = Typography;

const SecretVersionHistory = ({ visible, secretName, onClose, onRestore }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewingVersion, setViewingVersion] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
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
      setViewModalVisible(true);
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

  const handleCloseViewModal = () => {
    setViewModalVisible(false);
    setViewingVersion(null);
  };

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
        className="version-history-modal"
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
          />

          <VersionHistoryTable
            versions={versions}
            loading={loading}
            restoring={restoring}
            onView={handleViewVersion}
            onRestore={handleRestoreVersion}
          />
        </Space>
      </Modal>

      <VersionDetailModal
        visible={viewModalVisible}
        version={viewingVersion}
        onClose={handleCloseViewModal}
      />
    </>
  );
};

export default SecretVersionHistory;
