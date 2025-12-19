import React from 'react';
import { Card, Select, Button, Space } from 'antd';
import { SwapOutlined, SyncOutlined } from '@ant-design/icons';

const { Option } = Select;

const ComparisonHeader = ({
  environments,
  sourceEnv,
  targetEnv,
  loading,
  onSourceChange,
  onTargetChange,
  onSwap,
  onCompare,
}) => {
  return (
    <Card size="small" title="Select Environments">
      <Space size="large" align="center" style={{ width: '100%', justifyContent: 'center' }}>
        <div>
          <div style={{ marginBottom: '8px', fontWeight: 600 }}>Source Environment</div>
          <Select value={sourceEnv} onChange={onSourceChange} style={{ width: 200 }} size="large">
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
        </div>

        <Button icon={<SwapOutlined />} onClick={onSwap} size="large" type="dashed">
          Swap
        </Button>

        <div>
          <div style={{ marginBottom: '8px', fontWeight: 600 }}>Target Environment</div>
          <Select value={targetEnv} onChange={onTargetChange} style={{ width: 200 }} size="large">
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
        </div>

        <Button
          type="primary"
          icon={<SyncOutlined />}
          onClick={onCompare}
          loading={loading}
          size="large"
        >
          Compare
        </Button>
      </Space>
    </Card>
  );
};

export default ComparisonHeader;
