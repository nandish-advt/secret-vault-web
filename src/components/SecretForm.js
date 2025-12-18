import React, { useState } from 'react';
import { Card, Form, Input, Button, Alert, Space } from 'antd';
import { PlusOutlined, EyeInvisibleOutlined, EyeOutlined, SaveOutlined } from '@ant-design/icons';
import { secretsApi, getCurrentEnvironment } from '../services/api';
import './SecretForm.css';

const SecretForm = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showValue, setShowValue] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const currentEnv = getCurrentEnvironment();
      const result = await secretsApi.createSecret(values.name, values.value, currentEnv);
      
      setSuccess(`Secret "${result.name}" created successfully in ${result.environment}!${result.nameWasSanitized ? ' (name was sanitized)' : ''}`);
      form.resetFields();
      setShowValue(false);
      
      if (onSuccess) {
        onSuccess(result.name);
      }

      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create secret');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className="secret-form-card"
      title={
        <Space>
          <PlusOutlined />
          <span>Create or Update Secret</span>
        </Space>
      }
    >
      {success && (
        <Alert
          message="Success"
          description={success}
          type="success"
          showIcon
          closable
          onClose={() => setSuccess(null)}
          style={{ marginBottom: '16px' }}
        />
      )}

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: '16px' }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          label="Secret Name"
          name="name"
          rules={[
            { required: true, message: 'Please enter secret name' },
            { min: 1, max: 127, message: 'Name must be between 1-127 characters' },
          ]}
          extra="Use letters, numbers, and hyphens. Spaces will be converted to hyphens."
        >
          <Input
            placeholder="e.g., database-password"
            prefix={<span style={{ marginRight: '4px' }}>🔑</span>}
            disabled={loading}
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Secret Value"
          name="value"
          rules={[{ required: true, message: 'Please enter secret value' }]}
        >
          <Input.Password
            placeholder="Enter secret value"
            visibilityToggle={{
              visible: showValue,
              onVisibleChange: setShowValue,
            }}
            iconRender={(visible) =>
              visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
            }
            disabled={loading}
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={loading}
            block
            size="large"
          >
            {loading ? 'Creating Secret...' : 'Create Secret'}
          </Button>
        </Form.Item>
      </Form>

      <Alert
        message="Note"
        description="If a secret with the same name exists, it will be updated with the new value."
        type="info"
        showIcon
        style={{ marginTop: '16px' }}
      />
    </Card>
  );
};

export default SecretForm;