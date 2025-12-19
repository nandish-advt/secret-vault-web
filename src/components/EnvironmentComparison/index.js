import React, { useState, useEffect } from 'react';
import { Card, Space, Alert, Spin, message, Form, Modal } from 'antd';
import {
  SyncOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { secretsApi } from '../../services/api';
import ComparisonHeader from './ComparisonHeader';
import ComparisonResults from './ComparisonResults';
import ComparisonTable from './ComparisonTable';
import CopyConfirmModal from './CopyConfirmModal';
import EditSecretsModal from './EditSecretsModal';
import AzureCliModal from './AzureCliModal';
import SecretPreviewDrawer from './SecretPreviewDrawer';
import {
  getEnvironmentName,
  prepareTableData,
  getCopyableSecrets,
  exportComparison,
} from './utils/comparisonHelpers';
import { generateAzureCliCommands, extractVaultName } from './utils/azureCliGenerator';
import './styles.css';

const EnvironmentComparison = () => {
  // State - Environments
  const [environments, setEnvironments] = useState([]);
  const [sourceEnv, setSourceEnv] = useState(null);
  const [targetEnv, setTargetEnv] = useState(null);

  // State - Comparison
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSecrets, setSelectedSecrets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // State - Copy operations
  const [copying, setCopying] = useState(false);
  const [copyModalVisible, setCopyModalVisible] = useState(false);
  const [copyModalData, setCopyModalData] = useState(null);

  // State - Edit before copy
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingSecrets, setEditingSecrets] = useState([]);
  const [editForm] = Form.useForm();

  // State - Azure CLI
  const [azCliModalVisible, setAzCliModalVisible] = useState(false);
  const [azCliCommands, setAzCliCommands] = useState('');

  // State - Preview
  const [previewDrawerVisible, setPreviewDrawerVisible] = useState(false);
  const [previewSecret, setPreviewSecret] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    loadEnvironments();
  }, []);

  const loadEnvironments = async () => {
    try {
      const data = await secretsApi.getEnvironments();
      setEnvironments(data);

      if (data.length >= 2) {
        setSourceEnv(data[0].id);
        setTargetEnv(data[1].id);
      }
    } catch (err) {
      message.error('Failed to load environments');
      console.error('Error loading environments:', err);
    }
  };

  const handleCompare = async () => {
    if (!sourceEnv || !targetEnv) {
      message.warning('Please select both source and target environments');
      return;
    }

    if (sourceEnv === targetEnv) {
      message.warning('Source and target environments must be different');
      return;
    }

    try {
      setLoading(true);
      setComparison(null);
      setSelectedSecrets([]);

      const data = await secretsApi.compareEnvironments(sourceEnv, targetEnv);
      setComparison(data);

      message.success('Comparison completed');
    } catch (err) {
      message.error(`Failed to compare: ${err.response?.data?.message || err.message}`);
      console.error('Error comparing environments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapEnvironments = () => {
    const temp = sourceEnv;
    setSourceEnv(targetEnv);
    setTargetEnv(temp);
    setComparison(null);
    setSelectedSecrets([]);
  };

  const handleSecretSelect = (secretName, checked) => {
    if (checked) {
      setSelectedSecrets([...selectedSecrets, secretName]);
    } else {
      setSelectedSecrets(selectedSecrets.filter((s) => s !== secretName));
    }
  };

  const handleSelectAll = () => {
    const copyable = getCopyableSecrets(comparison, searchTerm);
    setSelectedSecrets(copyable);
  };

  const handleDeselectAll = () => {
    setSelectedSecrets([]);
  };

  const handleExport = () => {
    if (!comparison) {
      message.warning('No comparison to export');
      return;
    }
    exportComparison(comparison, environments, sourceEnv, targetEnv);
    message.success('Comparison report exported');
  };

  // Preview secret
  const handlePreview = async (secretName) => {
    try {
      setPreviewLoading(true);
      setPreviewDrawerVisible(true);

      const data = await secretsApi.getSecret(secretName, sourceEnv);
      setPreviewSecret(data);
    } catch (err) {
      message.error('Failed to load secret');
      setPreviewDrawerVisible(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Direct copy
  const handleDirectCopy = () => {
    if (selectedSecrets.length === 0) {
      message.warning('Please select secrets to copy');
      return;
    }

    const sourceEnvName = getEnvironmentName(environments, sourceEnv);
    const targetEnvName = getEnvironmentName(environments, targetEnv);

    setCopyModalData({
      secrets: [...selectedSecrets],
      sourceEnv,
      targetEnv,
      sourceEnvName,
      targetEnvName,
    });

    setCopyModalVisible(true);
  };

  const handleConfirmDirectCopy = async () => {
    if (!copyModalData) return;

    try {
      setCopyModalVisible(false);
      setCopying(true);
      message.loading({ content: 'Copying secrets...', key: 'copying', duration: 0 });

      const result = await secretsApi.copyMultipleSecrets(
        copyModalData.secrets,
        copyModalData.sourceEnv,
        copyModalData.targetEnv
      );

      message.destroy('copying');

      const successCount = result?.successCount || 0;
      const failureCount = result?.failureCount || 0;

      if (failureCount === 0) {
        message.success(`Successfully copied ${successCount} secret(s)!`);
      } else if (successCount === 0) {
        message.error(`Failed to copy all ${failureCount} secret(s)`);
      } else {
        message.warning(`Copied ${successCount} secret(s), ${failureCount} failed`);
      }

      await handleCompare();
      setSelectedSecrets([]);
      setCopyModalData(null);
    } catch (err) {
      message.destroy('copying');
      message.error(`Failed to copy secrets: ${err.response?.data?.message || err.message}`);
    } finally {
      setCopying(false);
    }
  };

  // Edit before copy
  const handleEditBeforeCopy = async () => {
    if (selectedSecrets.length === 0) {
      message.warning('Please select secrets to copy');
      return;
    }

    try {
      message.loading({ content: 'Loading secrets...', key: 'loading', duration: 0 });
      setLoading(true);

      const secretsData = [];

      for (const secretName of selectedSecrets) {
        try {
          const data = await secretsApi.getSecret(secretName, sourceEnv);
          secretsData.push({
            name: data.name,
            originalValue: data.value,
            editedValue: data.value,
            updatedOn: data.updatedOn,
          });
        } catch (err) {
          console.error(`Error loading secret ${secretName}:`, err);
          message.error(`Failed to load secret: ${secretName}`);
        }
      }

      if (secretsData.length === 0) {
        message.error('Failed to load any secrets');
        message.destroy('loading');
        setLoading(false);
        return;
      }

      setEditingSecrets(secretsData);

      const initialValues = {};
      secretsData.forEach((secret) => {
        initialValues[secret.name] = secret.originalValue;
      });

      editForm.setFieldsValue(initialValues);

      message.destroy('loading');
      message.success(`Loaded ${secretsData.length} secret(s) for editing`);

      setEditModalVisible(true);
    } catch (err) {
      console.error('Error in handleEditBeforeCopy:', err);
      message.error(`Failed to load secrets: ${err.message}`);
      message.destroy('loading');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmEditedCopy = async () => {
    try {
      const values = await editForm.validateFields();

      setCopying(true);
      setEditModalVisible(false);

      const copyPromises = editingSecrets.map(async (secret) => {
        const editedValue = values[secret.name];

        try {
          await secretsApi.createSecret(secret.name, editedValue, targetEnv);

          return {
            secretName: secret.name,
            success: true,
            wasEdited: editedValue !== secret.originalValue,
            message: 'Secret copied successfully',
          };
        } catch (err) {
          return {
            secretName: secret.name,
            success: false,
            message: err.response?.data?.message || err.message,
          };
        }
      });

      const results = await Promise.all(copyPromises);

      const successCount = results.filter((r) => r.success).length;
      const failureCount = results.filter((r) => !r.success).length;
      const editedCount = results.filter((r) => r.wasEdited).length;

      if (failureCount === 0) {
        message.success(
          `Successfully copied ${successCount} secret(s)! ${editedCount > 0 ? `(${editedCount} edited)` : ''}`
        );
      } else {
        Modal.warning({
          title: 'Copy Completed with Errors',
          content: (
            <div>
              <p>
                <CheckCircleOutlined style={{ color: '#52c41a' }} /> Success: {successCount}
              </p>
              <p>
                <CloseCircleOutlined style={{ color: '#f5222d' }} /> Failed: {failureCount}
              </p>
            </div>
          ),
        });
      }

      await handleCompare();
      setSelectedSecrets([]);
      setEditingSecrets([]);
      editForm.resetFields();
    } catch (err) {
      message.error('Validation failed');
    } finally {
      setCopying(false);
    }
  };

  // Azure CLI generation
  const handleGenerateAzCli = async () => {
    if (selectedSecrets.length === 0) {
      message.warning('Please select secrets to generate commands');
      return;
    }

    try {
      message.loading({ content: 'Generating Azure CLI commands...', key: 'azcli', duration: 0 });
      setLoading(true);

      const targetEnvObj = environments.find((e) => e.id === targetEnv);
      const targetVaultName = extractVaultName(targetEnvObj?.keyVaultUrl);

      const secretsWithValues = [];
      for (const secretName of selectedSecrets) {
        try {
          const data = await secretsApi.getSecret(secretName, sourceEnv);
          secretsWithValues.push({
            name: data.name,
            value: data.value,
          });
        } catch (err) {
          console.error(`Error loading secret ${secretName}:`, err);
        }
      }

      const commands = generateAzureCliCommands(
        secretsWithValues,
        targetVaultName,
        targetEnvObj?.name
      );

      setAzCliCommands(commands);
      setAzCliModalVisible(true);
      message.destroy('azcli');
      message.success('Azure CLI commands generated!');
    } catch (err) {
      console.error('Error generating CLI commands:', err);
      message.destroy('azcli');
      message.error('Failed to generate commands');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAzCli = () => {
    navigator.clipboard.writeText(azCliCommands);
    message.success('Commands copied to clipboard!');
  };

  const handleDownloadAzCli = () => {
    const blob = new Blob([azCliCommands], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    const targetEnvObj = environments.find((e) => e.id === targetEnv);
    const targetVaultName = extractVaultName(targetEnvObj?.keyVaultUrl);

    a.download = `azcli-${targetVaultName}-${Date.now()}.ps1`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('Commands downloaded!');
  };

  const tableData = prepareTableData(comparison, searchTerm);

  return (
    <>
      <Card
        className="environment-comparison-card"
        title={
          <Space>
            <SyncOutlined />
            <span>Environment Comparison</span>
          </Space>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <ComparisonHeader
            environments={environments}
            sourceEnv={sourceEnv}
            targetEnv={targetEnv}
            loading={loading}
            onSourceChange={setSourceEnv}
            onTargetChange={setTargetEnv}
            onSwap={handleSwapEnvironments}
            onCompare={handleCompare}
          />

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin size="large" tip="Comparing environments..." />
            </div>
          ) : comparison ? (
            <>
              <ComparisonResults
                comparison={comparison}
                environments={environments}
                sourceEnv={sourceEnv}
                targetEnv={targetEnv}
              />

              <ComparisonTable
                tableData={tableData}
                selectedSecrets={selectedSecrets}
                searchTerm={searchTerm}
                copying={copying}
                onSearchChange={setSearchTerm}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
                onSecretSelect={handleSecretSelect}
                onExport={handleExport}
                onGenerateCli={handleGenerateAzCli}
                onEditAndCopy={handleEditBeforeCopy}
                onDirectCopy={handleDirectCopy}
                onPreview={handlePreview}
              />

              <Alert
                message="Copy Options"
                description={
                  <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
                    <li>
                      <strong>Copy Selected:</strong> Copy secrets as-is without editing
                    </li>
                    <li>
                      <strong>Edit & Copy:</strong> Review and edit secret values before copying
                      (recommended for environment-specific values)
                    </li>
                    <li>Secrets marked "Only in Source" will be created in target</li>
                    <li>Secrets marked "In Both" will overwrite the target version</li>
                    <li>Secrets marked "Only in Target" cannot be copied</li>
                  </ul>
                }
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
              />
            </>
          ) : (
            <Alert
              message="No Comparison Results"
              description="Select two different environments and click 'Compare' to see the differences"
              type="info"
              showIcon
            />
          )}
        </Space>
      </Card>

      {/* Modals and Drawers */}
      <SecretPreviewDrawer
        visible={previewDrawerVisible}
        secret={previewSecret}
        loading={previewLoading}
        onClose={() => {
          setPreviewDrawerVisible(false);
          setPreviewSecret(null);
        }}
      />

      <CopyConfirmModal
        visible={copyModalVisible}
        secretCount={copyModalData?.secrets.length || 0}
        sourceEnvName={copyModalData?.sourceEnvName}
        targetEnvName={copyModalData?.targetEnvName}
        secretsList={copyModalData?.secrets}
        onConfirm={handleConfirmDirectCopy}
        onCancel={() => {
          setCopyModalVisible(false);
          setCopyModalData(null);
        }}
        loading={copying}
      />

      <EditSecretsModal
        visible={editModalVisible}
        editingSecrets={editingSecrets}
        form={editForm}
        loading={copying}
        onConfirm={handleConfirmEditedCopy}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingSecrets([]);
          editForm.resetFields();
        }}
      />

      <AzureCliModal
        visible={azCliModalVisible}
        commands={azCliCommands}
        onClose={() => setAzCliModalVisible(false)}
        onCopy={handleCopyAzCli}
        onDownload={handleDownloadAzCli}
      />
    </>
  );
};

export default EnvironmentComparison;
