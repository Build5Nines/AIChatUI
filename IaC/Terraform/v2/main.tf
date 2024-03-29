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
    
    openai_sku                      = "S0"

    azure_search_sku                = "standard"

    openai_deployment_name          = "b59-gpt4"

    azure_storage_sku               = "Standard"
    azure_storage_replication_type  = "LRS"

    azure_storage_blob_container_name = "docs"

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

resource azurerm_search_service azuresearch {
  name                = "${local.resource_prefix}-search"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = local.azure_search_sku
  tags                = local.resourceTags
}

resource azurerm_storage_account azurestorage {
  name                      = "${lower(replace(local.resource_prefix, "-", ""))}sa"
  resource_group_name       = azurerm_resource_group.rg.name
  location                  = azurerm_resource_group.rg.location
  account_kind              = "StorageV2"
  account_tier              = local.azure_storage_sku
  account_replication_type  = local.azure_storage_replication_type
  enable_https_traffic_only = true
  tags                      = local.resourceTags
}
resource azurerm_storage_container azurestoragecontainer {
  name                  = local.azure_storage_blob_container_name
  storage_account_name  = azurerm_storage_account.azurestorage.name
}

resource "azapi_resource" azureopenaideployment {
  type = "Microsoft.CognitiveServices/accounts/deployments@2023-05-01"
  name = local.openai_deployment_name
  parent_id = azurerm_cognitive_account.azureopenai.id
  body = jsonencode({
    properties = {
      model = {
        format = "OpenAI"
        name = "gpt-4"
        version = "1106-Preview"
      }
      versionUpgradeOption = "OnceCurrentVersionExpired"
      raiPolicyName = "Microsoft.Default"
    }
    sku = {
      capacity = 10
      name = "Standard"
    }
  })
}