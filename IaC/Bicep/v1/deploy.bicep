
param resourcePrefix string = 'b59-eus2-aichatui'

param location string = resourceGroup().location

param azureOpenAISku string = 'S0'

param openai_deployment_name string = 'b59-gpt35-turbo'

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

resource azureopenaideployment 'Microsoft.CognitiveServices/accounts/deployments@2023-05-01' = {
  name: openai_deployment_name
  sku: {
    capacity: 120
    name: 'Standard'
  }
  parent: azureopenai
  properties: {
    model: {
      format: 'OpenAI'
      name: 'gpt-35-turbo'
      version: '0613'
    }
    raiPolicyName: 'Microsoft.Default'
    versionUpgradeOption: 'OnceCurrentVersionExpired'
    scaleSettings: {
      capacity: 120
    }
  }
}
