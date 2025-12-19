import React from 'react';
import { Modal, Space, Descriptions, Tag, Typography, Alert, Button } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { formatDate } from './utils';

const { Text, Paragraph } = Typography;

const VersionDetailModal = ({ visible, version, onClose }) => {
  return (
    <Modal
      title={
        <Space>
          <ClockCircleOutlined />
          <span>Version Details</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={600}
      footer={[
        <button key="close" onClick={onClose}>
          Close
        </button>,
      ]}
    >
      {version && (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Secret Name">
              <Text code>{version.name}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="Version">
              <Text code style={{ fontSize: '11px' }}>
                {version.version}
              </Text>
            </Descriptions.Item>

            <Descriptions.Item label="Status">
              {version.enabled ? (
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
                {version.value}
              </Paragraph>
            </Descriptions.Item>

            <Descriptions.Item label="Created">{formatDate(version.createdOn)}</Descriptions.Item>

            <Descriptions.Item label="Updated">{formatDate(version.updatedOn)}</Descriptions.Item>

            {version.expiresOn && (
              <Descriptions.Item label="Expires">{formatDate(version.expiresOn)}</Descriptions.Item>
            )}

            {version.contentType && (
              <Descriptions.Item label="Content Type">
                <Tag>{version.contentType}</Tag>
              </Descriptions.Item>
            )}

            {version.tags && Object.keys(version.tags).length > 0 && (
              <Descriptions.Item label="Tags">
                <Space wrap>
                  {Object.entries(version.tags).map(([key, value]) => (
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
  );
};

export default VersionDetailModal;
