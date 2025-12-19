import React from 'react';
import { Row, Col, Card, Statistic, Space, Tag } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { getEnvironmentColor } from './utils/comparisonHelpers';

const ComparisonResults = ({ comparison, environments, sourceEnv, targetEnv }) => {
  if (!comparison) return null;

  const sourceColor = getEnvironmentColor(environments, sourceEnv);
  const targetColor = getEnvironmentColor(environments, targetEnv);

  return (
    <Row gutter={16}>
      <Col span={8}>
        <Card>
          <Statistic
            title={
              <Space>
                <Tag color={sourceColor}>Source</Tag>
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
                <Tag color={targetColor}>Target</Tag>
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
  );
};

export default ComparisonResults;
