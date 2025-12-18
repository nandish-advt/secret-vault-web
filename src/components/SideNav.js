import React, { useState } from 'react';
import { Layout, Menu, Tooltip } from 'antd';
import {
  KeyOutlined,
  DatabaseOutlined,
  SafetyOutlined,
  AppstoreOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { orgConfig } from '../styles/theme';
import './SideNav.css';

const { Sider } = Layout;

const SideNav = ({ activeModule, onModuleChange }) => {
  const [collapsed, setCollapsed] = useState(true);

  const menuItems = [
    {
      key: 'keyvault',
      icon: <KeyOutlined />,
      label: 'Key Vault',
      title: 'Azure Key Vault Management',
    },
    {
      key: 'sqlserver',
      icon: <DatabaseOutlined />,
      label: 'SQL Server',
      title: 'Azure SQL Server Management',
      disabled: true,
      badge: 'Coming Soon',
    },
    {
      key: 'storage',
      icon: <AppstoreOutlined />,
      label: 'Storage',
      title: 'Azure Storage Management',
      disabled: true,
      badge: 'Coming Soon',
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (onModuleChange && menuItems.find((item) => item.key === key && !item.disabled)) {
      onModuleChange(key);
    }
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      className="side-nav"
      width={250}
      collapsedWidth={80}
      trigger={null}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 101,
      }}
    >
      <div className="side-nav-header">
        <div className="logo-container">
          {collapsed ? (
            <span className="logo-icon">🔑</span>
          ) : (
            <>
              <span className="logo-icon">🔑</span>
              <span className="logo-text">Azure Tools</span>
            </>
          )}
        </div>
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[activeModule]}
        onClick={handleMenuClick}
        className="side-nav-menu"
      >
        {menuItems.map((item) => (
          <Menu.Item
            key={item.key}
            icon={item.icon}
            disabled={item.disabled}
            className={item.disabled ? 'menu-item-disabled' : ''}
          >
            <span className="menu-label">
              {item.label}
              {item.badge && <span className="menu-badge">{item.badge}</span>}
            </span>
          </Menu.Item>
        ))}
      </Menu>

      <div className="side-nav-footer">
        <Tooltip title={collapsed ? 'Expand' : 'Collapse'} placement="right">
          <div className="collapse-trigger" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
        </Tooltip>
      </div>

      <div className="side-nav-version">
        {!collapsed && <span className="version-text">v1.0.0</span>}
      </div>
    </Sider>
  );
};

export default SideNav;
