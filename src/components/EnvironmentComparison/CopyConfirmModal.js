import React from 'react';
import { Modal } from 'antd';

const CopyConfirmModal = ({
  visible,
  secretCount,
  sourceEnvName,
  targetEnvName,
  secretsList,
  onConfirm,
  onCancel,
  loading,
}) => {
  return (
    <Modal
      title="Copy Secrets"
      open={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Copy"
      cancelText="Cancel"
      confirmLoading={loading}
      width={500}
    >
      <div>
        <p>
          Copy <strong>{secretCount}</strong> secret(s) without editing?
        </p>

        <div
          style={{
            marginTop: '16px',
            padding: '16px',
            backgroundColor: '#fff7e6',
            border: '1px solid #ffd591',
            borderRadius: '8px',
          }}
        >
          <div style={{ marginBottom: '12px', fontWeight: 600, fontSize: '14px' }}>
            ⚠️ Direct Copy
          </div>

          <div style={{ marginBottom: '8px' }}>
            <strong>From:</strong>{' '}
            <span
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                backgroundColor: '#1890ff',
                color: '#fff',
                borderRadius: '4px',
                fontSize: '13px',
                marginLeft: '8px',
              }}
            >
              {sourceEnvName}
            </span>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <strong>To:</strong>{' '}
            <span
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                backgroundColor: '#52c41a',
                color: '#fff',
                borderRadius: '4px',
                fontSize: '13px',
                marginLeft: '8px',
              }}
            >
              {targetEnvName}
            </span>
          </div>

          <div
            style={{
              marginTop: '12px',
              fontSize: '13px',
              lineHeight: '1.6',
            }}
          >
            Values will be copied as-is. Existing secrets in target will be{' '}
            <strong>overwritten</strong>.
          </div>
        </div>

        {secretsList && secretsList.length > 0 && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#f0f0f0',
              borderRadius: '4px',
            }}
          >
            <strong>Secrets to copy:</strong>
            <ul
              style={{
                marginTop: '8px',
                marginBottom: '0',
                paddingLeft: '20px',
              }}
            >
              {secretsList.map((secret, idx) => (
                <li key={idx}>
                  <code style={{ fontSize: '12px' }}>{secret}</code>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CopyConfirmModal;
