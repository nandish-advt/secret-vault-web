import React, { useState } from 'react';
import { Layout, Tabs, ConfigProvider, message } from 'antd';
import { KeyOutlined, FileTextOutlined, SyncOutlined, DatabaseOutlined } from '@ant-design/icons';
import SideNav from './components/SideNav';
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
  const [activeModule, setActiveModule] = useState('keyvault');

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
    setSelectedSecret(null);
    setRefreshTrigger((prev) => prev + 1);
    setActiveTab('secrets');
  };

  const handleModuleChange = (module) => {
    console.log('Module changed to:', module);
    setActiveModule(module);

    // Show coming soon message for disabled modules
    if (module !== 'keyvault') {
      message.info(`${module} module is coming soon!`);
    }
  };

  const renderContent = () => {
    switch (activeModule) {
      case 'keyvault':
        return (
          <Tabs activeKey={activeTab} onChange={setActiveTab} size="large" className="main-tabs">
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
                  <SyncOutlined />
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
        );

      case 'sqlserver':
        return (
          <div className="coming-soon">
            <div className="coming-soon-content">
              <DatabaseOutlined className="coming-soon-icon" />
              <h2>Azure SQL Server Management</h2>
              <p>
                Coming Soon! This module will allow you to manage SQL databases, users, and
                permissions.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
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
        <SideNav activeModule={activeModule} onModuleChange={handleModuleChange} />

        <Layout className="main-layout">
          <Header onEnvironmentChange={handleEnvironmentChange} />

          <Content className="app-content">
            <div className="content-container">{renderContent()}</div>
          </Content>

          <Footer className="app-footer">
            <p>Azure Management Tools © 2025 | Multi-Environment Support</p>
          </Footer>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
