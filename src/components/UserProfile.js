import React, { useState, useEffect } from 'react';
import { Space, Avatar, Dropdown, Tag, Divider, Typography } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, IdcardOutlined } from '@ant-design/icons';
import './UserProfile.css';

const { Text } = Typography;

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      // Try to get user info from API
      const response = await fetch('/api/User/profile', {
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // Not authenticated - show default developer mode
        setUser({
          name: 'Developer',
          email: 'developer@local.dev',
          role: 'Developer',
          isDevelopment: true,
        });
        setIsAuthenticated(false);
      }
    } catch (error) {
      // API not responding or auth not enabled - development mode
      setUser({
        name: 'Developer',
        email: 'developer@local.dev',
        role: 'Developer',
        isDevelopment: true,
      });
      setIsAuthenticated(false);
    }
  };

  const handleLogout = () => {
    // Redirect to logout endpoint
    window.location.href = '/.auth/logout?post_logout_redirect_uri=/';
  };

  const getInitials = (name) => {
    if (!name) return 'D';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const menuItems = [
    {
      key: 'profile',
      icon: <IdcardOutlined />,
      label: (
        <div style={{ padding: '8px 0' }}>
          <Text strong>{user?.name || 'Developer'}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {user?.email || 'developer@local.dev'}
          </Text>
        </div>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'role',
      icon: <SettingOutlined />,
      label: (
        <Space>
          <span>Role:</span>
          <Tag color="blue">{user?.role || 'Developer'}</Tag>
        </Space>
      ),
    },
    ...(isAuthenticated
      ? [
          {
            type: 'divider',
          },
          {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Sign Out',
            onClick: handleLogout,
            danger: true,
          },
        ]
      : []),
  ];

  if (!user) {
    return null;
  }

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['click']}
      placement="bottomRight"
    >
      <div className="user-profile">
        <Space size="middle">
          {user.isDevelopment && (
            <Tag color="orange" style={{ margin: 0 }}>
              Dev Mode
            </Tag>
          )}
          <Avatar
            style={{
              backgroundColor: user.isDevelopment ? '#fa8c16' : '#1890ff',
              cursor: 'pointer',
            }}
            icon={<UserOutlined />}
          >
            {getInitials(user.name)}
          </Avatar>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-email">{user.email}</div>
          </div>
        </Space>
      </div>
    </Dropdown>
  );
};

export default UserProfile;