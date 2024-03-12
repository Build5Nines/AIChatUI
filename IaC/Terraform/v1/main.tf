terraform {
  required_providers {
    # AzureRM provider 3.x
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3"
    }
  }
}

provider "azurerm" {
  features {}
}

locals {
    resource_prefix           = "b59-eus2-aichatui"
    location                  = "eastus2"
    
    openai_sku                = "S0"

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