import React from 'react';
import { Drawer, Space, Spin, Typography, Alert } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { formatDate } from './utils/comparisonHelpers';

const { Text, Paragraph } = Typography;

const SecretPreviewDrawer = ({ visible, secret, loading, onClose }) => {
  return (
    <Drawer
      title={
        <Space>
          <EyeOutlined />
          <span>Secret Preview</span>
        </Space>
      }
      placement="right"
      width={500}
      onClose={onClose}
      open={visible}
    >
      {loading ? (
        <Spin tip="Loading secret..." />
      ) : secret ? (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong>Name:</Text>
            <br />
            <Paragraph code copyable>
              {secret.name}
            </Paragraph>
          </div>

          <div>
            <Text strong>Value:</Text>
            <br />
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
              {secret.value}
            </Paragraph>
          </div>

          <div>
            <Text strong>Last Updated:</Text>
            <br />
            <Text>{formatDate(secret.updatedOn)}</Text>
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
  );
};

export default SecretPreviewDrawer;
