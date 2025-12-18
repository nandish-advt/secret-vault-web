const CracoLessPlugin = require('craco-less');

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              // Ant Design theme customization
              '@primary-color': '#1890ff',              // Primary color
              '@link-color': '#1890ff',                 // Link color
              '@success-color': '#52c41a',              // Success color
              '@warning-color': '#faad14',              // Warning color
              '@error-color': '#f5222d',                // Error color
              '@font-size-base': '14px',                // Base font size
              '@heading-color': 'rgba(0, 0, 0, 0.85)',  // Heading color
              '@text-color': 'rgba(0, 0, 0, 0.65)',     // Text color
              '@border-radius-base': '6px',             // Border radius
              '@box-shadow-base': '0 2px 8px rgba(0, 0, 0, 0.15)', // Shadow
              
              // Layout
              '@layout-header-background': '#001529',
              '@layout-body-background': '#f0f2f5',
              
              // Card
              '@card-radius': '12px',
              '@card-shadow': '0 2px 8px rgba(0, 0, 0, 0.1)',
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};