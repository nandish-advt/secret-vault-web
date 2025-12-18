import React, { useState, useEffect } from 'react';
import { 
  Card, Select, Button, Table, Tag, Space, Alert, Spin, message, Modal, 
  Checkbox, Statistic, Row, Col, Input, Tooltip, Form, Drawer, Typography,
  Divider
} from 'antd';
import { 
  SwapOutlined, 
  SyncOutlined,
  CopyOutlined, 
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CodeOutlined,
  DownloadOutlined,
  EyeOutlined,
  EditOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { secretsApi } from '../services/api';
import './EnvironmentComparison.css';

const { Option } = Select;
const { Search } = Input;
const { Text, Paragraph } = Typography;
const { TextArea } = Input;

const EnvironmentComparison = () => {
  const [environments, setEnvironments] = useState([]);
  const [sourceEnv, setSourceEnv] = useState(null);
  const [targetEnv, setTargetEnv] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSecrets, setSelectedSecrets] = useState([]);
  const [copying, setCopying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Preview & Edit
  const [previewDrawerVisible, setPreviewDrawerVisible] = useState(false);
  const [previewSecret, setPreviewSecret] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  
  // Edit before copy
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingSecrets, setEditingSecrets] = useState([]);
  const [editForm] = Form.useForm();

// Copy confirmation modal state
const [showCopyModal, setShowCopyModal] = useState(false);
const [copyModalData, setCopyModalData] = useState(null);

// Azure CLI Export
const [azCliModalVisible, setAzCliModalVisible] = useState(false);
const [azCliCommands, setAzCliCommands] = useState('');

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

  const handleEditBeforeCopy = async () => {
    if (selectedSecrets.length === 0) {
      message.warning('Please select secrets to copy');
      return;
    }

    console.log('🔵 Starting Edit Before Copy...');
  console.log('Selected secrets:', selectedSecrets);
  console.log('Source environment:', sourceEnv);


    try {
        message.loading({ content: 'Loading secrets...', key: 'loading', duration: 0 });

      setLoading(true);
      
      // Load all selected secrets
      const secretsData = [];
      for (const secretName of selectedSecrets) {
        try {
          const data = await secretsApi.getSecret(secretName, sourceEnv);
          secretsData.push({
            name: data.name,
            originalValue: data.value,
            editedValue: data.value,
            updatedOn: data.updatedOn
          });
        } catch (err) {
          console.error(`Error loading secret ${secretName}:`, err);
        }
      }

      setEditingSecrets(secretsData);
      
      // Set initial form values
      const initialValues = {};
      secretsData.forEach(secret => {
        initialValues[secret.name] = secret.originalValue;
      });
      editForm.setFieldsValue(initialValues);
      
      setEditModalVisible(true);
    } catch (err) {
      message.error('Failed to load secrets for editing');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmEditedCopy = async () => {
    try {
      const values = await editForm.validateFields();
      
      setCopying(true);
      setEditModalVisible(false);

      const sourceEnvName = environments.find(e => e.id === sourceEnv)?.name;
      const targetEnvName = environments.find(e => e.id === targetEnv)?.name;

      const copyPromises = editingSecrets.map(async (secret) => {
        const editedValue = values[secret.name];
        
        try {
          // Copy with edited value
          await secretsApi.createSecret(secret.name, editedValue, targetEnv);
          
          return {
            secretName: secret.name,
            success: true,
            wasEdited: editedValue !== secret.originalValue,
            message: 'Secret copied successfully'
          };
        } catch (err) {
          return {
            secretName: secret.name,
            success: false,
            message: err.response?.data?.message || err.message
          };
        }
      });

      const results = await Promise.all(copyPromises);
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      const editedCount = results.filter(r => r.wasEdited).length;

      if (failureCount === 0) {
        message.success(
          `Successfully copied ${successCount} secret(s)! ${editedCount > 0 ? `(${editedCount} edited)` : ''}`
        );
      } else {
        Modal.warning({
          title: 'Copy Completed with Errors',
          content: (
            <div>
              <p><CheckCircleOutlined style={{ color: '#52c41a' }} /> Success: {successCount}</p>
              <p><CloseCircleOutlined style={{ color: '#f5222d' }} /> Failed: {failureCount}</p>
            </div>
          ),
        });
      }

      // Refresh comparison
      handleCompare();
      setSelectedSecrets([]);
      setEditingSecrets([]);
      editForm.resetFields();
    } catch (err) {
      message.error('Validation failed');
    } finally {
      setCopying(false);
    }
  };


const handleCopySelected = () => {
  if (selectedSecrets.length === 0) {
    message.warning('Please select secrets to copy');
    return;
  }

  const sourceEnvName = environments.find(e => e.id === sourceEnv)?.name || sourceEnv;
  const targetEnvName = environments.find(e => e.id === targetEnv)?.name || targetEnv;

  console.log('🔵 Copy Selected Started');
  
  setCopyModalData({
    secrets: [...selectedSecrets],
    sourceEnv,
    targetEnv,
    sourceEnvName,
    targetEnvName
  });
  
  setShowCopyModal(true);
};

const handleConfirmCopyModal = async () => {
  if (!copyModalData) return;

  try {
    console.log('✅ User confirmed copy');
    setShowCopyModal(false);
    setCopying(true);
    message.loading({ content: 'Copying secrets...', key: 'copying', duration: 0 });
    
    console.log('📤 Calling copyMultipleSecrets API...');
    const result = await secretsApi.copyMultipleSecrets(
      copyModalData.secrets,
      copyModalData.sourceEnv,
      copyModalData.targetEnv
    );

    console.log('📥 API Result:', result);

    message.destroy('copying');

    const successCount = result?.successCount || 0;
    const failureCount = result?.failureCount || 0;

    console.log(`✅ Success: ${successCount}, ❌ Failed: ${failureCount}`);

    if (failureCount === 0) {
      message.success(`Successfully copied ${successCount} secret(s)!`);
    } else if (successCount === 0) {
      message.error(`Failed to copy all ${failureCount} secret(s)`);
    } else {
      message.warning(`Copied ${successCount} secret(s), ${failureCount} failed`);
    }

    console.log('🔄 Refreshing comparison...');
    await handleCompare();
    setSelectedSecrets([]);
    setCopyModalData(null);
    
  } catch (err) {
    console.error('❌ Copy error:', err);
    message.destroy('copying');
    
    const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
    message.error(`Failed to copy secrets: ${errorMessage}`);
  } finally {
    setCopying(false);
  }
};

  const handleSwapEnvironments = () => {
    const temp = sourceEnv;
    setSourceEnv(targetEnv);
    setTargetEnv(temp);
    setComparison(null);
    setSelectedSecrets([]);
  };

  const exportComparison = () => {
    if (!comparison) {
      message.warning('No comparison to export');
      return;
    }
    
    const sourceEnvName = environments.find(e => e.id === sourceEnv)?.name;
    const targetEnvName = environments.find(e => e.id === targetEnv)?.name;
    
    const report = {
      comparedAt: new Date().toISOString(),
      source: {
        id: sourceEnv,
        name: sourceEnvName
      },
      target: {
        id: targetEnv,
        name: targetEnvName
      },
      summary: comparison.summary,
      onlyInSource: comparison.onlyInEnv1,
      onlyInTarget: comparison.onlyInEnv2,
      inBoth: comparison.inBoth
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comparison-${sourceEnv}-vs-${targetEnv}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    message.success('Comparison report exported');
  };

  const getSourceEnvColor = () => {
    return environments.find(e => e.id === sourceEnv)?.color || '#1890ff';
  };

  const getTargetEnvColor = () => {
    return environments.find(e => e.id === targetEnv)?.color || '#52c41a';
  };

  const columns = [
    {
      title: 'Select',
      key: 'select',
      width: 60,
      render: (_, record) => (
        <Checkbox
          checked={selectedSecrets.includes(record.name)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedSecrets([...selectedSecrets, record.name]);
            } else {
              setSelectedSecrets(selectedSecrets.filter(s => s !== record.name));
            }
          }}
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
      render: (_, record) => (
        <Space>
          {record.status !== 'onlyInTarget' && (
            <Tooltip title="Preview secret value">
              <Button 
                size="small" 
                icon={<EyeOutlined />}
                onClick={() => handlePreview(record.name)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const getTableData = () => {
    if (!comparison) return [];

    let data = [];

    comparison.onlyInEnv1?.forEach(name => {
      data.push({ name, status: 'onlyInSource', key: `source-${name}` });
    });

    comparison.inBoth?.forEach(name => {
      data.push({ name, status: 'inBoth', key: `both-${name}` });
    });

    comparison.onlyInEnv2?.forEach(name => {
      data.push({ name, status: 'onlyInTarget', key: `target-${name}` });
    });

    // Filter by search term
    if (searchTerm) {
      data = data.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return data;
  };

  const selectAll = () => {
    if (!comparison) return;
    
    const copyable = [
      ...(comparison.onlyInEnv1 || []),
      ...(comparison.inBoth || [])
    ];
    
    // Apply search filter
    const filtered = copyable.filter(name =>
      searchTerm ? name.toLowerCase().includes(searchTerm.toLowerCase()) : true
    );
    
    setSelectedSecrets(filtered);
  };

  const deselectAll = () => {
    setSelectedSecrets([]);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const generateAzCliCommands = async () => {
  if (selectedSecrets.length === 0) {
    message.warning('Please select secrets to generate commands');
    return;
  }

  try {
    message.loading({ content: 'Generating Azure CLI commands...', key: 'azcli', duration: 0 });
    setLoading(true);

    const targetEnvObj = environments.find(e => e.id === targetEnv);
    const targetVaultName = targetEnvObj?.keyVaultUrl
      ?.split('//')[1]
      ?.split('.')[0] || 'your-keyvault-name';

    // Load secret values from source
    const secretsWithValues = [];
    for (const secretName of selectedSecrets) {
      try {
        const data = await secretsApi.getSecret(secretName, sourceEnv);
        secretsWithValues.push({
          name: data.name,
          value: data.value
        });
      } catch (err) {
        console.error(`Error loading secret ${secretName}:`, err);
      }
    }

    // Generate PowerShell commands
    let commands = `# ============================================================
# Azure Key Vault Secret Management Commands (PowerShell)
# ============================================================
# Generated: ${new Date().toLocaleString()}
# Target Key Vault: ${targetVaultName}
# Number of Secrets: ${secretsWithValues.length}
# ============================================================

# Prerequisites: Install Azure CLI and login
# Install: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
# Login: az login

# ============================================================
# Set Secrets (Copy ${selectedSecrets.length} secret(s) to ${targetEnvObj?.name})
# ============================================================

`;

    secretsWithValues.forEach((secret, index) => {
      // Escape single quotes in value for PowerShell
      const escapedValue = secret.value.replace(/'/g, "''");
      
      commands += `# Secret ${index + 1}: ${secret.name}
az keyvault secret set \`
  --vault-name "${targetVaultName}" \`
  --name "${secret.name}" \`
  --value '${escapedValue}'

`;
    });

    commands += `
# ============================================================
# Useful Azure Key Vault Commands
# ============================================================

# List all secrets in the Key Vault
az keyvault secret list \`
  --vault-name "${targetVaultName}" \`
  --query "[].{Name:name, Enabled:attributes.enabled, Updated:attributes.updated}" \`
  --output table

# Get a specific secret value
az keyvault secret show \`
  --vault-name "${targetVaultName}" \`
  --name "<SecretName>" \`
  --query "value" \`
  --output tsv

# Delete a secret (soft delete - can be recovered)
az keyvault secret delete \`
  --vault-name "${targetVaultName}" \`
  --name "<SecretName>"

# List deleted secrets (can be recovered)
az keyvault secret list-deleted \`
  --vault-name "${targetVaultName}" \`
  --output table

# Recover a deleted secret
az keyvault secret recover \`
  --vault-name "${targetVaultName}" \`
  --name "<SecretName>"

# Purge a deleted secret (permanent - cannot be recovered)
az keyvault secret purge \`
  --vault-name "${targetVaultName}" \`
  --name "<SecretName>"

# Show secret versions
az keyvault secret list-versions \`
  --vault-name "${targetVaultName}" \`
  --name "<SecretName>" \`
  --output table

# Set secret with expiration date
az keyvault secret set \`
  --vault-name "${targetVaultName}" \`
  --name "<SecretName>" \`
  --value "<SecretValue>" \`
  --expires "2025-12-31T23:59:59Z"

# Disable a secret
az keyvault secret set-attributes \`
  --vault-name "${targetVaultName}" \`
  --name "<SecretName>" \`
  --enabled false

# Enable a secret
az keyvault secret set-attributes \`
  --vault-name "${targetVaultName}" \`
  --name "<SecretName>" \`
  --enabled true

# Download all secrets to local files (backup)
$secrets = az keyvault secret list \`
  --vault-name "${targetVaultName}" \`
  --query "[].name" \`
  --output tsv

foreach ($secretName in $secrets) {
    $value = az keyvault secret show \`
      --vault-name "${targetVaultName}" \`
      --name $secretName \`
      --query "value" \`
      --output tsv
    
    Set-Content -Path ".\\$secretName.txt" -Value $value
    Write-Host "Exported: $secretName"
}

# Bulk set secrets from JSON file
# First, create a JSON file with format:
# {
#   "secret1": "value1",
#   "secret2": "value2"
# }

$secrets = Get-Content "secrets.json" | ConvertFrom-Json
$secrets.PSObject.Properties | ForEach-Object {
    az keyvault secret set \`
      --vault-name "${targetVaultName}" \`
      --name $_.Name \`
      --value $_.Value
}

# Grant access to a user/service principal
az keyvault set-policy \`
  --name "${targetVaultName}" \`
  --upn "<user@domain.com>" \`
  --secret-permissions get list set delete

# Grant access to a managed identity
az keyvault set-policy \`
  --name "${targetVaultName}" \`
  --object-id "<managed-identity-object-id>" \`
  --secret-permissions get list

# Check Key Vault access policies
az keyvault show \`
  --name "${targetVaultName}" \`
  --query "properties.accessPolicies" \`
  --output table

# Enable soft-delete (recommended)
az keyvault update \`
  --name "${targetVaultName}" \`
  --enable-soft-delete true \`
  --retention-days 90

# Enable purge protection (prevents permanent deletion)
az keyvault update \`
  --name "${targetVaultName}" \`
  --enable-purge-protection true

# Get Key Vault properties
az keyvault show \`
  --name "${targetVaultName}" \`
  --output table

# Search for secrets by name pattern
az keyvault secret list \`
  --vault-name "${targetVaultName}" \`
  --query "[?contains(name, 'database')]" \`
  --output table

# Export secrets to CSV
az keyvault secret list \`
  --vault-name "${targetVaultName}" \`
  --query "[].{Name:name, Enabled:attributes.enabled, Created:attributes.created, Updated:attributes.updated}" \`
  --output tsv | Out-File -FilePath "secrets.csv"

# ============================================================
# Troubleshooting Commands
# ============================================================

# Check if you have access to the Key Vault
az keyvault secret list \`
  --vault-name "${targetVaultName}" \`
  --query "length(@)"

# Get your current Azure account
az account show \`
  --query "{Name:name, SubscriptionId:id, TenantId:tenantId}" \`
  --output table

# List all Key Vaults in subscription
az keyvault list \`
  --query "[].{Name:name, ResourceGroup:resourceGroup, Location:location}" \`
  --output table

# Check Key Vault firewall rules
az keyvault show \`
  --name "${targetVaultName}" \`
  --query "properties.networkAcls" \`
  --output json

# ============================================================
# IMPORTANT NOTES
# ============================================================
# 1. Make sure you're logged in: az login
# 2. Select correct subscription: az account set --subscription "<subscription-id>"
# 3. You need appropriate permissions on the Key Vault
# 4. Soft-deleted secrets can be recovered within retention period
# 5. Use --dry-run flag to test commands without making changes (where available)
# 6. Always backup secrets before bulk operations
# 7. Be careful with purge operations - they are permanent!
# ============================================================
`;

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

const copyAzCliCommands = () => {
  navigator.clipboard.writeText(azCliCommands);
  message.success('Commands copied to clipboard!');
};

const downloadAzCliCommands = () => {
  const blob = new Blob([azCliCommands], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  
  const targetEnvObj = environments.find(e => e.id === targetEnv);
  const targetVaultName = targetEnvObj?.keyVaultUrl?.split('//')[1]?.split('.')[0] || 'keyvault';
  
  a.download = `azcli-${targetVaultName}-${Date.now()}.ps1`;
  a.click();
  URL.revokeObjectURL(url);
  message.success('Commands downloaded!');
};

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
          {/* Environment Selection */}
          <Card size="small" title="Select Environments">
            <Space size="large" align="center" style={{ width: '100%', justifyContent: 'center' }}>
              <div>
                <div style={{ marginBottom: '8px', fontWeight: 600 }}>Source Environment</div>
                <Select
                  value={sourceEnv}
                  onChange={setSourceEnv}
                  style={{ width: 200 }}
                  size="large"
                >
                  {environments.map(env => (
                    <Option key={env.id} value={env.id}>
                      <Space>
                        <span
                          style={{
                            display: 'inline-block',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: env.color,
                          }}
                        />
                        {env.name}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </div>

              <Button
                icon={<SwapOutlined />}
                onClick={handleSwapEnvironments}
                size="large"
                type="dashed"
              >
                Swap
              </Button>

              <div>
                <div style={{ marginBottom: '8px', fontWeight: 600 }}>Target Environment</div>
                <Select
                  value={targetEnv}
                  onChange={setTargetEnv}
                  style={{ width: 200 }}
                  size="large"
                >
                  {environments.map(env => (
                    <Option key={env.id} value={env.id}>
                      <Space>
                        <span
                          style={{
                            display: 'inline-block',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: env.color,
                          }}
                        />
                        {env.name}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </div>

              <Button
                type="primary"
                icon={<SyncOutlined />}
                onClick={handleCompare}
                loading={loading}
                size="large"
              >
                Compare
              </Button>
            </Space>
          </Card>

          {/* Comparison Results */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin size="large" tip="Comparing environments..." />
            </div>
          ) : comparison ? (
            <>
              {/* Summary Statistics */}
              <Row gutter={16}>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title={
                        <Space>
                          <Tag color={getSourceEnvColor()}>Source</Tag>
                          Total Secrets
                        </Space>
                      }
                      value={comparison.totalInEnv1}
                      prefix={<CheckCircleOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title={
                        <Space>
                          <Tag color={getTargetEnvColor()}>Target</Tag>
                          Total Secrets
                        </Space>
                      }
                      value={comparison.totalInEnv2}
                      prefix={<CheckCircleOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Differences"
                      value={comparison.summary.onlyInEnv1Count + comparison.summary.onlyInEnv2Count}
                      valueStyle={{ color: '#faad14' }}
                      prefix={<ExclamationCircleOutlined />}
                    />
                  </Card>
                </Col>
              </Row>

              {/* Detailed Comparison */}
              <Card
                size="small"
                title="Detailed Comparison"
                extra={
                  <Space>
                    <Search
                      placeholder="Search secrets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ width: 200 }}
                      allowClear
                    />
                    <Button size="small" onClick={selectAll}>
                      Select All
                    </Button>
                    <Button size="small" onClick={deselectAll}>
                      Deselect All
                    </Button>
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={exportComparison}
                      size="small"
                    >
                      Export
                    </Button>
                    <Button
        icon={<CodeOutlined />}
        onClick={generateAzCliCommands}
        size="small"
        type="dashed"
        disabled={selectedSecrets.length === 0}
        style={{ 
          borderColor: '#0078d4',
          color: '#0078d4'
        }}
      >
        Azure CLI
      </Button>
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={handleEditBeforeCopy}
                      loading={copying}
                      disabled={selectedSecrets.length === 0}
                      style={{ backgroundColor: '#faad14', borderColor: '#faad14' }}
                    >
                      Edit & Copy ({selectedSecrets.length})
                    </Button>
                    <Button
                      type="primary"
                      icon={<CopyOutlined />}
                      onClick={handleCopySelected}
                      loading={copying}
                      disabled={selectedSecrets.length === 0}
                    >
                      Copy Selected ({selectedSecrets.length})
                    </Button>
                  </Space>
                }
              >
                <Table
                  columns={columns}
                  dataSource={getTableData()}
                  pagination={{ pageSize: 20 }}
                  size="small"
                />
              </Card>

              <Alert
                message="Copy Options"
                description={
                  <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
                    <li><strong>Copy Selected:</strong> Copy secrets as-is without editing</li>
                    <li><strong>Edit & Copy:</strong> Review and edit secret values before copying (recommended for environment-specific values)</li>
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

      {/* Preview Drawer */}
      <Drawer
        title={
          <Space>
            <EyeOutlined />
            <span>Secret Preview</span>
          </Space>
        }
        placement="right"
        width={500}
        onClose={() => setPreviewDrawerVisible(false)}
        open={previewDrawerVisible}
      >
        {previewLoading ? (
          <Spin tip="Loading secret..." />
        ) : previewSecret ? (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text strong>Name:</Text>
              <br />
              <Paragraph code copyable>{previewSecret.name}</Paragraph>
            </div>
            
            <div>
              <Text strong>Value:</Text>
              <br />
              <Paragraph code copyable style={{ wordBreak: 'break-all' }}>
                {previewSecret.value}
              </Paragraph>
            </div>
            
            <div>
              <Text strong>Last Updated:</Text>
              <br />
              <Text>{formatDate(previewSecret.updatedOn)}</Text>
            </div>

            <Alert
              message="Preview Mode"
              description="This is the current value in the source environment"
              type="info"
              showIcon
            />
          </Space>
        ) : null}
      </Drawer>

      {/* Edit Before Copy Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            <span>Edit Secrets Before Copying to target environment</span>
          </Space>
        }
        open={editModalVisible}
        onOk={handleConfirmEditedCopy}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingSecrets([]);
          editForm.resetFields();
        }}
        width={800}
        okText="Copy with Changes"
        cancelText="Cancel"
        okButtonProps={{ loading: copying }}
      >
        <Alert
          message="Review and Edit"
          description={
            <div>
              <p>Review and modify secret values before copying to target environment.</p>
              <p><strong>Tip:</strong> Edit environment-specific values like URLs, API endpoints, or connection strings.</p>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: '20px' }}
        />

        <Form
          form={editForm}
          layout="vertical"
        >
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {editingSecrets.map((secret, index) => (
              <Card 
                key={secret.name}
                size="small"
                style={{ marginBottom: '16px' }}
                title={
                  <Space>
                    <Text code>{secret.name}</Text>
                    {secret.originalValue !== editForm.getFieldValue(secret.name) && (
                      <Tag color="orange">Modified</Tag>
                    )}
                  </Space>
                }
              >
                <Form.Item
                  name={secret.name}
                  label="Secret Value"
                  rules={[{ required: true, message: 'Value is required' }]}
                >
                  <TextArea
                    rows={3}
                    placeholder="Enter secret value"
                    style={{ fontFamily: 'monospace' }}
                  />
                </Form.Item>
                
                <div style={{ marginTop: '8px' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Original: <code style={{ fontSize: '11px' }}>{secret.originalValue.substring(0, 50)}{secret.originalValue.length > 50 ? '...' : ''}</code>
                  </Text>
                </div>
              </Card>
            ))}
          </div>
        </Form>
      </Modal>

      {/* Copy Confirmation Modal - ADD THIS */}
      <Modal
      title="Copy Secrets"
      open={showCopyModal}
      onOk={handleConfirmCopyModal}
      onCancel={() => {
        setShowCopyModal(false);
        setCopyModalData(null);
      }}
      okText="Copy"
      cancelText="Cancel"
      confirmLoading={copying}
      width={500}
    >
      {copyModalData && (
        <div>
          <p>
            Copy <strong>{copyModalData.secrets.length}</strong> secret(s) without editing?
          </p>
          
          <div style={{ 
            marginTop: '16px',
            padding: '16px', 
            backgroundColor: '#fff7e6', 
            border: '1px solid #ffd591',
            borderRadius: '8px'
          }}>
            <div style={{ marginBottom: '12px', fontWeight: 600, fontSize: '14px' }}>
              ⚠️ Direct Copy
            </div>
            
            <div style={{ marginBottom: '8px' }}>
              <strong>From:</strong>{' '}
              <span style={{ 
                display: 'inline-block',
                padding: '4px 12px',
                backgroundColor: '#1890ff',
                color: '#fff',
                borderRadius: '4px',
                fontSize: '13px',
                marginLeft: '8px'
              }}>
                {copyModalData.sourceEnvName}
              </span>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <strong>To:</strong>{' '}
              <span style={{ 
                display: 'inline-block',
                padding: '4px 12px',
                backgroundColor: '#52c41a',
                color: '#fff',
                borderRadius: '4px',
                fontSize: '13px',
                marginLeft: '8px'
              }}>
                {copyModalData.targetEnvName}
              </span>
            </div>
            
            <div style={{ 
              marginTop: '12px', 
              fontSize: '13px',
              lineHeight: '1.6'
            }}>
              Values will be copied as-is. Existing secrets in target will be <strong>overwritten</strong>.
            </div>
          </div>

          <div style={{ 
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#f0f0f0',
            borderRadius: '4px'
          }}>
            <strong>Secrets to copy:</strong>
            <ul style={{ 
              marginTop: '8px',
              marginBottom: '0',
              paddingLeft: '20px'
            }}>
              {copyModalData.secrets.map((secret, idx) => (
                <li key={idx}>
                  <code style={{ fontSize: '12px' }}>{secret}</code>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Modal>

    {/* Azure CLI Commands Modal - ADD THIS */}
<Modal
  title={
    <Space>
      <CodeOutlined style={{ color: '#0078d4' }} />
      <span>Azure CLI PowerShell Commands</span>
    </Space>
  }
  open={azCliModalVisible}
  onCancel={() => setAzCliModalVisible(false)}
  width={900}
  footer={[
    <Button key="close" onClick={() => setAzCliModalVisible(false)}>
      Close
    </Button>,
    <Button 
      key="copy" 
      type="default"
      icon={<CopyOutlined />}
      onClick={copyAzCliCommands}
    >
      Copy All
    </Button>,
    <Button
      key="download"
      type="primary"
      icon={<DownloadOutlined />}
      onClick={downloadAzCliCommands}
    >
      Download .ps1
    </Button>,
  ]}
>
  <Space direction="vertical" style={{ width: '100%' }} size="large">
    <Alert
      message="Azure CLI PowerShell Commands"
      description={
        <div>
          <p>Copy these commands and paste into your <strong>PowerShell terminal</strong> with Azure CLI installed.</p>
          <p style={{ marginBottom: 0 }}>
            Prerequisites: <code>az login</code> and appropriate Key Vault permissions.
          </p>
        </div>
      }
      type="info"
      showIcon
    />

    <div style={{
      backgroundColor: '#1e1e1e',
      padding: '16px',
      borderRadius: '8px',
      maxHeight: '500px',
      overflowY: 'auto',
      fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
    }}>
      <pre style={{
        margin: 0,
        color: '#d4d4d4',
        fontSize: '12px',
        lineHeight: '1.6',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
      }}>
        {azCliCommands}
      </pre>
    </div>

    <Alert
      message="Quick Tips"
      description={
        <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
          <li>Use <code>az login</code> before running commands</li>
          <li>Ensure you have <strong>Key Vault Secrets Officer</strong> role</li>
          <li>Commands use backtick (`) for line continuation in PowerShell</li>
          <li>Test with one secret first before bulk operations</li>
          <li>Soft-deleted secrets can be recovered within 90 days</li>
        </ul>
      }
      type="warning"
      showIcon
    />
  </Space>
</Modal>
    </>
  );
};



export default EnvironmentComparison;