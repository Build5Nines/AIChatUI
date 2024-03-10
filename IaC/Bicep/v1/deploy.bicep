
param resource_prefix string = 'b59-eus2-aichatui'

param location string = resourceGroup().location

param azure_openai_aku string = 'S0'

var resourceTags = {
  project: 'https://github.com/build5nines/AIChatUI'
}

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
