// Global theme configuration
// Update these values to match your organization's branding
export const theme = {
  // Primary Colors
  primaryColor: '#018848', // Main brand color (Ant Design default)
  secondaryColor: '#52c41a', // Success/secondary actions

  // Header/Banner Colors
  headerBackground: '#001529', // Dark blue (professional)
  headerTextColor: '#ffffff',
  headerAccentColor: '#1890ff',

  // Status Colors
  successColor: '#52c41a', // Green
  warningColor: '#faad14', // Orange
  errorColor: '#f5222d', // Red
  infoColor: '#1890ff', // Blue

  // Environment Badge Colors
  envProduction: '#f5222d', // Red
  envStaging: '#faad14', // Orange
  envDevelopment: '#52c41a', // Green
  envDefault: '#8c8c8c', // Gray

  // Typography
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontSizeLarge: '20px',
  fontSizeBase: '14px',
  fontSizeSmall: '12px',

  // Spacing
  spacingSmall: '8px',
  spacingMedium: '16px',
  spacingLarge: '24px',

  // Borders
  borderRadius: '6px',
  borderRadiusLarge: '12px',
  borderColor: '#d9d9d9',

  // Shadows
  boxShadowSmall: '0 2px 4px rgba(0, 0, 0, 0.1)',
  boxShadowMedium: '0 2px 8px rgba(0, 0, 0, 0.1)',
  boxShadowLarge: '0 4px 12px rgba(0, 0, 0, 0.15)',
};

// Organization-specific configuration
// Change these values to match your company branding
export const orgConfig = {
  companyName: 'Your Organization',
  appName: 'Key Vault Manager',
  logo: null, // Set to logo URL when available
  supportEmail: 'support@yourorg.com',
  documentationUrl: 'https://docs.yourorg.com',
};

export default theme;
