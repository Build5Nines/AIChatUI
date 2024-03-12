const { OpenAIClient, AzureKeyCredential } = require("@azure/openai"); 

const azure_openai_endpoint = process.env["AZURE_OPENAI_API_ENDPOINT"];  
const azure_openai_api_key = process.env["AZURE_OPENAI_API_KEY"];
const azure_openai_deployment = process.env["AZURE_OPENAI_API_DEPLOYMENT_NAME"];

const azure_search_endpoint = process.env["AZURE_SEARCH_ENDPOINT"];
const azure_search_key = process.env["AZURE_SEARCH_KEY"];
const azure_search_index_name = process.env["AZURE_SEARCH_INDEX_NAME"];

// https://learn.microsoft.com/javascript/api/%40azure/openai/openaiclient?view=azure-node-preview
const chatClient = new OpenAIClient(
    azure_openai_endpoint,
    new AzureKeyCredential(azure_openai_api_key)
    );

// Store conversation history in memory for demonstration purposes.  
// In a production environment, consider storing this data in a persistent store.  
let conversationHistory = [];

function clearConversationHistory() {
    conversationHistory = [
        { role: "system", content: "" }
    ];
}
clearConversationHistory()

module.exports = (app) => {
    /**
     * @openapi
     * /v2/chat:
     *   post:
     *     tags:
     *     - v2
     *     description: Perform Chat Completion
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               prompt:
     *                 type: string
     *                 default: ""
     *     responses:
     *       200:
     *         description: Returns the OpenAI chat completion response.
     *         responseBody:
     *           content:
     *             application/json:
     *               schema:
     *                 type: object
     */
    app.post(`/v2/chat`, async (req, res) => {  
        const prompt = req.body.prompt;  
        if (!prompt) {  
            return res.status(400).send('Prompt is required');  
        }  
    
        // Add the user's prompt to the conversation history  
        conversationHistory.push({ role: "user", content: prompt });  
    
        try {  
            // https://learn.microsoft.com/javascript/api/%40azure/openai/openaiclient
            const chatResponse = await chatClient.getChatCompletions(
                azure_openai_deployment, // deployment name
                conversationHistory, // chat request messages array
                { // getCompletionsOptions - https://learn.microsoft.com/javascript/api/%40azure/openai/getchatcompletionsoptions
                    azureExtensionOptions: { // https://learn.microsoft.com/javascript/api/%40azure/openai/azureextensionsoptions
                        extensions: [
                            // https://learn.microsoft.com/javascript/api/@azure/openai/azurecognitivesearchchatextensionconfiguration
                            {
                                type: 'AzureCognitiveSearch',
                                endpoint: azure_search_endpoint,
                                indexName: azure_search_index_name,
                                key: azure_search_key,
                                queryType: 'simple', // https://learn.microsoft.com/javascript/api/%40azure/openai/azurecognitivesearchquerytype
                                strictness: 3, // https://learn.microsoft.com/avascript/api/@azure/openai/azurecognitivesearchchatextensionconfiguration?view=azure-node-preview#@azure-openai-azurecognitivesearchchatextensionconfiguration-strictness
                                topNDocuments: 5, // https://learn.microsoft.com/javascript/api/@azure/openai/azurecognitivesearchchatextensionconfiguration?view=azure-node-preview#@azure-openai-azurecognitivesearchchatextensionconfiguration-topndocuments
                                roleInformation: // https://learn.microsoft.com/javascript/api/@azure/openai/azurecognitivesearchchatextensionconfiguration?view=azure-node-preview#@azure-openai-azurecognitivesearchchatextensionconfiguration-roleinformation
                                    "You are an AI assistant that helps people find information.",
                            }
                        ]
                    }
                }
                );  
    
            // Add the system's response to the conversation history  
            const systemResponse = chatResponse.choices[0].message.content;  
            conversationHistory.push({ role: "assistant", content: systemResponse });  
    
            //return res.json({ response: systemResponse });
            return res.json(chatResponse);
        } catch (error) {  
            console.error(error);  
            return res.status(500).send('Error processing your request');  
        }  
    });

    /**
     * @openapi
     * /v2/history:
     *   get:
     *     tags:
     *     - v2
     *     description: Retrieve Chat History
     *     responses:
     *       200:
     *         description: Returns the OpenAI chat completion response.
     *         responseBody:
     *           content:
     *             application/json:
     *               schema:
     *                 type: object
     */
    app.get(`/v2/history`, async (req, res) => {
        return res.json(conversationHistory);
    });

    /**
     * @openapi
     * /v2/clear:
     *   get:
     *     tags:
     *     - v2
     *     description: Clear Chat History
     *     responses:
     *       200:
     *         description: Returns clear chat completion response.
     */
    app.get(`/v2/clear`, async (req, res) => {
        clearConversationHistory();
        return res.status(200).send('Chat history cleared');
    });
}