# AIChatUI

AIChatUI is a simple chat UI with backend API for making chat completion called against Azure OpenAI Service. The API is written in Javascript using Node.js with Swagger UI support, and a static `Index.html` client for the front-end Chat UI.

This project is written by [Chris Pietschmann](https://www.linkedin.com/in/crpietschmann/).

The API versions are as follows:

- v1 - Makes chat completions against Azure OpenAI Service.
- v2 - Makes chat completions against Azure OpenAI Service with the integration of Azure Search Service too.

This application uses the `.env` file to configure the necessary environment variables. A list of what environment variables are necessary is included within the `.env.EXAMPLE` file.

This application assumes you have an instance of Azure OpenAI Service and Azure Search Service deployed to Microsoft Azure already.
