import React, { useState, useEffect } from 'react';
import { Select, Space, Tag, Modal, Descriptions, Alert, Spin, message } from 'antd';
import {
  SwapOutlined,
  InfoCircleOutlined,
  LockOutlined,
  CloudServerOutlined,
} from '@ant-design/icons';
import { secretsApi, setCurrentEnvironment, getCurrentEnvironment } from '../services/api';
import './EnvironmentSelector.css';

const { Option } = Select;

const EnvironmentSelector = ({ onEnvironmentChange }) => {
  const [environments, setEnvironments] = useState([]);
  const [selectedEnvId, setSelectedEnvId] = useState(getCurrentEnvironment());
  const [selectedEnv, setSelectedEnv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [switchingEnv, setSwitchingEnv] = useState(null);

  useEffect(() => {
    loadEnvironments();
  }, []);

  const loadEnvironments = async () => {
    try {
      setLoading(true);
      const data = await secretsApi.getEnvironments();
      setEnvironments(data);

      // Set current environment
      const current = data.find((e) => e.id === selectedEnvId) || data[0];
      setSelectedEnv(current);
      setSelectedEnvId(current.id);
      setCurrentEnvironment(current.id);
    } catch (err) {
      message.error('Failed to load environments');
      console.error('Error loading environments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnvironmentChange = (envId) => {
    const newEnv = environments.find((e) => e.id === envId);
    if (!newEnv) return;

    // Show confirmation modal
    setSwitchingEnv(newEnv);
    setIsModalVisible(true);
  };

  const confirmSwitch = () => {
    if (!switchingEnv) return;

    // Switch environment
    setSelectedEnv(switchingEnv);
    setSelectedEnvId(switchingEnv.id);
    setCurrentEnvironment(switchingEnv.id);

    // Close modal
    setIsModalVisible(false);
    setSwitchingEnv(null);

    // Notify parent component
    if (onEnvironmentChange) {
      onEnvironmentChange(switchingEnv);
    }

    message.success(`Switched to ${switchingEnv.name} environment`);
  };

  const cancelSwitch = () => {
    setIsModalVisible(false);
    setSwitchingEnv(null);
  };

  if (loading) {
    return (
      <Space>
        <Spin size="small" />
        <span style={{ color: '#fff' }}>Loading environments...</span>
      </Space>
    );
  }

  if (!selectedEnv) {
    return (
      <Tag color="red">
        <CloudServerOutlined /> No Environment
      </Tag>
    );
  }

  return (
    <>
      <div className="environment-selector">
        <Space size="middle">
          <Tag
            color={selectedEnv.color}
            style={{
              padding: '6px 16px',
              fontSize: '14px',
              fontWeight: '600',
              borderRadius: '20px',
              border: 'none',
            }}
          >
            <LockOutlined style={{ marginRight: '6px' }} />
            {selectedEnv.keyVaultUrl
              ? selectedEnv.keyVaultUrl.split('//')[1].split('.')[0]
              : selectedEnv.name}
          </Tag>

          <Select
            value={selectedEnvId}
            onChange={handleEnvironmentChange}
            style={{ width: 180 }}
            size="large"
            suffixIcon={<SwapOutlined />}
          >
            {environments.map((env) => (
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
        </Space>
      </div>

      <Modal
        title={
          <Space>
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
            <span>Switch Environment</span>
          </Space>
        }
        open={isModalVisible}
        onOk={confirmSwitch}
        onCancel={cancelSwitch}
        okText="Switch"
        cancelText="Cancel"
        width={600}
      >
        {switchingEnv && (
          <>
            <Alert
              message="You are about to switch environments"
              description="All current data will be replaced with data from the new environment."
              type="warning"
              showIcon
              style={{ marginBottom: '20px' }}
            />

            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Current Environment">
                <Tag color={selectedEnv.color}>{selectedEnv.name}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="New Environment">
                <Tag color={switchingEnv.color}>{switchingEnv.name}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Key Vault URL">
                <code style={{ fontSize: '12px' }}>{switchingEnv.keyVaultUrl}</code>
              </Descriptions.Item>
              <Descriptions.Item label="Description">{switchingEnv.description}</Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Modal>
    </>
  );
};

export default EnvironmentSelector;
