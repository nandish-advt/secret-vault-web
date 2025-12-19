import React from 'react';
import { Modal, Form, Card, Tag, Alert, Space } from 'antd';
import { EditOutlined } from '@ant-design/icons';

import { Input, Typography } from 'antd';

const { TextArea } = Input;
const { Text } = Typography;

const EditSecretsModal = ({ visible, editingSecrets, form, loading, onConfirm, onCancel }) => {
  return (
    <Modal
      title={
        <Space>
          <EditOutlined />
          <span>Edit Secrets Before Copying</span>
        </Space>
      }
      open={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      width={800}
      okText="Copy with Changes"
      cancelText="Cancel"
      okButtonProps={{ loading }}
    >
      <Alert
        message="Review and Edit"
        description={
          <div>
            <p>Review and modify secret values before copying to target environment.</p>
            <p>
              <strong>Tip:</strong> Edit environment-specific values like URLs, API endpoints, or
              connection strings.
            </p>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: '20px' }}
      />

      <Form form={form} layout="vertical">
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {editingSecrets.map((secret) => (
            <Card
              key={secret.name}
              size="small"
              style={{ marginBottom: '16px' }}
              title={
                <Space>
                  <Text code>{secret.name}</Text>
                  {secret.originalValue !== form.getFieldValue(secret.name) && (
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
                  Original:{' '}
                  <code style={{ fontSize: '11px' }}>
                    {secret.originalValue.substring(0, 50)}
                    {secret.originalValue.length > 50 ? '...' : ''}
                  </code>
                </Text>
              </div>
            </Card>
          ))}
        </div>
      </Form>
    </Modal>
  );
};

export default EditSecretsModal;
