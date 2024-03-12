
param resourcePrefix string = 'b59-eus2-aichatui'

param location string = resourceGroup().location

param azureOpenAISku string = 'S0'

var resourceTags = {
  project: 'https://github.com/build5nines/AIChatUI'
}

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
