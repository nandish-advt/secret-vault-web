/**
 * Generate Azure CLI PowerShell commands for selected secrets
 */
export const generateAzureCliCommands = (secretsWithValues, targetVaultName, targetEnvName) => {
  let commands = `# ============================================================
# Azure Key Vault Secret Management Commands (PowerShell)
# ============================================================
# Generated: ${new Date().toLocaleString()}
# Target Key Vault: ${targetVaultName}
# Number of Secrets: ${secretsWithValues.length}
# ============================================================

# Prerequisites: Install Azure CLI and login
# Install: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
# Login: az login

# ============================================================
# Set Secrets (Copy ${secretsWithValues.length} secret(s) to ${targetEnvName})
# ============================================================

`;

  secretsWithValues.forEach((secret, index) => {
    const escapedValue = secret.value.replace(/'/g, "''");

    commands += `# Secret ${index + 1}: ${secret.name}
az keyvault secret set \`
  --vault-name "${targetVaultName}" \`
  --name "${secret.name}" \`
  --value '${escapedValue}'

`;
  });

  commands += `
# ============================================================
# Useful Azure Key Vault Commands
# ============================================================

# List all secrets in the Key Vault
az keyvault secret list \`
  --vault-name "${targetVaultName}" \`
  --query "[].{Name:name, Enabled:attributes.enabled, Updated:attributes.updated}" \`
  --output table

# Get a specific secret value
az keyvault secret show \`
  --vault-name "${targetVaultName}" \`
  --name "<SecretName>" \`
  --query "value" \`
  --output tsv

# Delete a secret (soft delete - can be recovered)
az keyvault secret delete \`
  --vault-name "${targetVaultName}" \`
  --name "<SecretName>"

# List deleted secrets (can be recovered)
az keyvault secret list-deleted \`
  --vault-name "${targetVaultName}" \`
  --output table

# Recover a deleted secret
az keyvault secret recover \`
  --vault-name "${targetVaultName}" \`
  --name "<SecretName>"

# Show secret versions
az keyvault secret list-versions \`
  --vault-name "${targetVaultName}" \`
  --name "<SecretName>" \`
  --output table

# Download all secrets to local files (backup)
$secrets = az keyvault secret list \`
  --vault-name "${targetVaultName}" \`
  --query "[].name" \`
  --output tsv

foreach ($secretName in $secrets) {
    $value = az keyvault secret show \`
      --vault-name "${targetVaultName}" \`
      --name $secretName \`
      --query "value" \`
      --output tsv
    
    Set-Content -Path ".\\$secretName.txt" -Value $value
    Write-Host "Exported: $secretName"
}

# Grant access to a managed identity
az keyvault set-policy \`
  --name "${targetVaultName}" \`
  --object-id "<managed-identity-object-id>" \`
  --secret-permissions get list

# Enable soft-delete (recommended)
az keyvault update \`
  --name "${targetVaultName}" \`
  --enable-soft-delete true \`
  --retention-days 90

# ============================================================
# IMPORTANT NOTES
# ============================================================
# 1. Make sure you're logged in: az login
# 2. Select correct subscription: az account set --subscription "<subscription-id>"
# 3. You need appropriate permissions on the Key Vault
# 4. Soft-deleted secrets can be recovered within retention period
# ============================================================
`;

  return commands;
};

/**
 * Extract vault name from URL
 */
export const extractVaultName = (keyVaultUrl) => {
  if (!keyVaultUrl) return 'your-keyvault-name';
  return keyVaultUrl.split('//')[1]?.split('.')[0] || 'your-keyvault-name';
};
