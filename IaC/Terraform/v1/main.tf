terraform {
  required_providers {
    # AzureRM provider 3.x
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3"
    }
    azapi = {
      source = "azure/azapi"
    }
  }
}

provider "azurerm" {
  features {}
}

provider "azapi" {

}


locals {
    resource_prefix           = "b59-eus2-aichatui"
    location                  = "eastus2"
    
    openai_sku                = "S0"

    openai_deployment_name    = "b59-gpt35-turbo"

    resourceTags = {
        project = "https://github.com/build5nines/AIChatUI"
    }
}

resource azurerm_resource_group rg {
    name     = "${local.resource_prefix}-rg"
    location = local.location
    tags     = local.resourceTags
}

resource azurerm_cognitive_account azureopenai {
    name                = "${local.resource_prefix}-oai"
    resource_group_name = azurerm_resource_group.rg.name
    location            = azurerm_resource_group.rg.location
    kind                = "OpenAI"
    sku_name            = local.openai_sku
    tags                = local.resourceTags
}

# https://learn.microsoft.com/en-us/azure/templates/microsoft.cognitiveservices/accounts/deployments?pivots=deployment-language-terraform
resource "azapi_resource" azureopenaideployment {
  type = "Microsoft.CognitiveServices/accounts/deployments@2023-05-01"
  name = local.openai_deployment_name
  parent_id = azurerm_cognitive_account.azureopenai.id
  body = jsonencode({
    properties = {
      model = {
        format = "OpenAI"
        name = "gpt-35-turbo"
        version = "0613"
      }
      versionUpgradeOption = "OnceCurrentVersionExpired"
      raiPolicyName = "Microsoft.Default"
    }
    sku = {
      capacity = 120
      name = "Standard"
    }
  })
}
