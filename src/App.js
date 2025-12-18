import React, { useState } from 'react';
import { Layout, Tabs, ConfigProvider, message } from 'antd';
import { KeyOutlined, FileTextOutlined, SwapOutlined  } from '@ant-design/icons';
import Header from './components/Header';
import SecretList from './components/SecretList';
import SecretForm from './components/SecretForm';
import SecretDetail from './components/SecretDetail';
import AuditLogs from './components/AuditLogs';
import EnvironmentComparison from './components/EnvironmentComparison';
import { theme } from './styles/theme';
import './styles/global.css';
import './App.css';

const { Content, Footer } = Layout;
const { TabPane } = Tabs;

function App() {
  const [selectedSecret, setSelectedSecret] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('secrets');

  const handleSecretCreated = (secretName) => {
    setRefreshTrigger((prev) => prev + 1);
    setSelectedSecret(secretName);
  };

  const handleSecretDeleted = (secretName) => {
    setRefreshTrigger((prev) => prev + 1);
    if (selectedSecret === secretName) {
      setSelectedSecret(null);
    }
  };

  const handleEnvironmentChange = (newEnvironment) => {
    message.success(`Switched to ${newEnvironment.name} environment`);
    
    // Reset state when switching environments
    setSelectedSecret(null);
    setRefreshTrigger((prev) => prev + 1);
    setActiveTab('secrets');
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: theme.primaryColor,
          colorSuccess: theme.successColor,
          colorWarning: theme.warningColor,
          colorError: theme.errorColor,
          colorInfo: theme.infoColor,
          borderRadius: parseInt(theme.borderRadius),
          fontFamily: theme.fontFamily,
        },
      }}
    >
      <Layout className="app-layout">
        <Header onEnvironmentChange={handleEnvironmentChange} />

        <Content className="app-content">
          <div className="content-container">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              size="large"
              className="main-tabs"
            >
              <TabPane
                tab={
                  <span>
                    <KeyOutlined />
                    Secrets Management
                  </span>
                }
                key="secrets"
              >
                <div className="secrets-grid">
                  <div className="grid-item">
                    <SecretList
                      onSelectSecret={setSelectedSecret}
                      selectedSecret={selectedSecret}
                      refreshTrigger={refreshTrigger}
                      onDelete={handleSecretDeleted}
                    />
                  </div>
                  <div className="grid-item">
                    <SecretForm onSuccess={handleSecretCreated} />
                  </div>
                  <div className="grid-item">
                    <SecretDetail
                      secretName={selectedSecret}
                      onClose={() => setSelectedSecret(null)}
                      onDelete={handleSecretDeleted}
                    />
                  </div>
                </div>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <SwapOutlined  />
                    Environment Comparison
                  </span>
                }
                key="comparison"
              >
                <div className="comparison-container">
                  <EnvironmentComparison />
                </div>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <FileTextOutlined />
                    Audit Logs
                  </span>
                }
                key="audit"
              >
                <div className="audit-container">
                  <AuditLogs refreshTrigger={refreshTrigger} />
                </div>
              </TabPane>
            </Tabs>
          </div>
        </Content>

        <Footer className="app-footer">
          <p>Key Vault Manager © 2025 | Multi-Environment Support</p>
        </Footer>
      </Layout>
    </ConfigProvider>
  );
}

export default App;