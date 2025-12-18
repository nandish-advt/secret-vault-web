import React from 'react';
import { Layout, Space } from 'antd';
import EnvironmentSelector from './EnvironmentSelector';
import UserProfile from './UserProfile';
import { orgConfig } from '../styles/theme';
import './Header.css';

const { Header: AntHeader } = Layout;

const Header = ({ onEnvironmentChange }) => {
  return (
    <AntHeader className="app-header">
      <div className="header-container">
        <div className="header-left">
          {orgConfig.logo ? (
            <img src={orgConfig.logo} alt="Logo" className="header-logo" />
          ) : (
            <span className="header-icon">🔐</span>
          )}
          <div className="header-text">
            <h1 className="header-title">{orgConfig.appName}</h1>
            <p className="header-subtitle">Multi-Environment Secret Management</p>
          </div>
        </div>
        <div className="header-right">
          <Space size="large">
            <EnvironmentSelector onEnvironmentChange={onEnvironmentChange} />
            <UserProfile />
          </Space>
        </div>
      </div>
    </AntHeader>
  );
};

export default Header;
