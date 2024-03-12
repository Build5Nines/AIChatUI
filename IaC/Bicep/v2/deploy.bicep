
param resource_prefix string = 'b59-eus2-aichatui'

param location string = resourceGroup().location

param azure_openai_aku string = 'S0'

param azure_search_sku string = 'standard'

param azure_storage_sku string = 'Standard_LRS'

var resourceTags = {
  project: 'https://github.com/build5nines/AIChatUI'
}

var resource_prefix_for_storage = replace(resource_prefix, '-', '')

resource azureopenai 'Microsoft.CognitiveServices/accounts@2023-10-01-preview' = {
  name: '${resource_prefix}-oai'
  location: location
  tags: resourceTags
  kind: 'OpenAI'
  sku: {
    name: azure_openai_aku
  }
  properties: {
    networkAcls: {
      defaultAction: 'Allow'
      virtualNetworkRules: []
      ipRules: []
    }
    publicNetworkAccess: 'Enabled'
  }
}

resource azuresearch 'Microsoft.Search/searchServices@2023-11-01' = {
  name: '${resource_prefix}-search'
  location: location
  tags: resourceTags
  sku: {
    name: azure_search_sku
  }
  properties: {
    replicaCount: 1
    partitionCount: 1
    hostingMode: 'default'
    publicNetworkAccess: 'enabled'
    networkRuleSet: {
      ipRules: []
    }
    encryptionWithCmk: {
      enforcement: 'Unspecified'
    }
    disableLocalAuth: false
    authOptions: {
      apiKeyOnly: {}
    }
    semanticSearch: 'disabled'
  }
}

resource storage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: '${resource_prefix_for_storage}sa'
  location: location
  tags: resourceTags
  sku: {
    name: azure_storage_sku
  }
  kind: 'StorageV2'
  properties: {
    publicNetworkAccess: 'Enabled'
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    allowSharedKeyAccess: true
    networkAcls: {
      bypass: 'AzureServices'
      virtualNetworkRules: []
      ipRules: []
      defaultAction: 'Allow'
    }
    supportsHttpsTrafficOnly: true
    accessTier: 'Hot'
  }
}
