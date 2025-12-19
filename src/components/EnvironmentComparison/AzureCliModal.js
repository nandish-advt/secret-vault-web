import React from 'react';
import { Modal, Space, Alert, Button } from 'antd';
import { CodeOutlined, CopyOutlined, DownloadOutlined } from '@ant-design/icons';

const AzureCliModal = ({ visible, commands, onClose, onCopy, onDownload }) => {
  return (
    <Modal
      title={
        <Space>
          <CodeOutlined style={{ color: '#0078d4' }} />
          <span>Azure CLI PowerShell Commands</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <Button key="copy" type="default" icon={<CopyOutlined />} onClick={onCopy}>
          Copy All
        </Button>,
        <Button key="download" type="primary" icon={<DownloadOutlined />} onClick={onDownload}>
          Download .ps1
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Alert
          message="Azure CLI PowerShell Commands"
          description={
            <div>
              <p>
                Copy these commands and paste into your <strong>PowerShell terminal</strong> with
                Azure CLI installed.
              </p>
              <p style={{ marginBottom: 0 }}>
                Prerequisites: <code>az login</code> and appropriate Key Vault permissions.
              </p>
            </div>
          }
          type="info"
          showIcon
        />

        <div
          style={{
            backgroundColor: '#1e1e1e',
            padding: '16px',
            borderRadius: '8px',
            maxHeight: '500px',
            overflowY: 'auto',
            fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
          }}
        >
          <pre
            style={{
              margin: 0,
              color: '#d4d4d4',
              fontSize: '12px',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {commands}
          </pre>
        </div>

        <Alert
          message="Quick Tips"
          description={
            <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
              <li>
                Use <code>az login</code> before running commands
              </li>
              <li>
                Ensure you have <strong>Key Vault Secrets Officer</strong> role
              </li>
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
  );
};

export default AzureCliModal;
