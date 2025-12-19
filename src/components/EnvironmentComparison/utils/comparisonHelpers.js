/**
 * Format date to readable string
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString();
};

/**
 * Get environment color by ID
 */
export const getEnvironmentColor = (environments, envId) => {
  return environments.find((e) => e.id === envId)?.color || '#1890ff';
};

/**
 * Get environment name by ID
 */
export const getEnvironmentName = (environments, envId) => {
  return environments.find((e) => e.id === envId)?.name || envId;
};

/**
 * Get environment details by ID
 */
export const getEnvironment = (environments, envId) => {
  return environments.find((e) => e.id === envId);
};

/**
 * Prepare table data from comparison results
 */
export const prepareTableData = (comparison, searchTerm = '') => {
  if (!comparison) return [];

  let data = [];

  // Secrets only in source
  comparison.onlyInEnv1?.forEach((name) => {
    data.push({ name, status: 'onlyInSource', key: `source-${name}` });
  });

  // Secrets in both
  comparison.inBoth?.forEach((name) => {
    data.push({ name, status: 'inBoth', key: `both-${name}` });
  });

  // Secrets only in target
  comparison.onlyInEnv2?.forEach((name) => {
    data.push({ name, status: 'onlyInTarget', key: `target-${name}` });
  });

  // Filter by search term
  if (searchTerm) {
    data = data.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }

  return data;
};

/**
 * Get copyable secrets (excluding onlyInTarget)
 */
export const getCopyableSecrets = (comparison, searchTerm = '') => {
  if (!comparison) return [];

  const copyable = [...(comparison.onlyInEnv1 || []), ...(comparison.inBoth || [])];

  return searchTerm
    ? copyable.filter((name) => name.toLowerCase().includes(searchTerm.toLowerCase()))
    : copyable;
};

/**
 * Export comparison to JSON
 */
export const exportComparison = (comparison, environments, sourceEnv, targetEnv) => {
  const sourceEnvName = getEnvironmentName(environments, sourceEnv);
  const targetEnvName = getEnvironmentName(environments, targetEnv);

  const report = {
    comparedAt: new Date().toISOString(),
    source: {
      id: sourceEnv,
      name: sourceEnvName,
    },
    target: {
      id: targetEnv,
      name: targetEnvName,
    },
    summary: comparison.summary,
    onlyInSource: comparison.onlyInEnv1,
    onlyInTarget: comparison.onlyInEnv2,
    inBoth: comparison.inBoth,
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `comparison-${sourceEnv}-vs-${targetEnv}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
