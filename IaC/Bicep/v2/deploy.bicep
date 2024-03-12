
param resourcePrefix string = 'b59-eus2-aichatui'

param location string = resourceGroup().location

param azureOpenAISku string = 'S0'

param azureSearchSku string = 'standard'

param azureStorageSku string = 'Standard_LRS'


var resourceTags = {
  project: 'https://github.com/build5nines/AIChatUI'
}

var resourcePrefix_for_storage = replace(resourcePrefix, '-', '')


resource azureopenai 'Microsoft.CognitiveServices/accounts@2023-10-01-preview' = {
  name: '${resourcePrefix}-oai'
  location: location
  tags: resourceTags
  kind: 'OpenAI'
  sku: {
    name: azureOpenAISku
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
  name: '${resourcePrefix}-search'
  location: location
  tags: resourceTags
  sku: {
    name: azureSearchSku
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
  name: '${resourcePrefix_for_storage}sa'
  location: location
  tags: resourceTags
  sku: {
    name: azureStorageSku
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
