const { OpenAIClient, AzureKeyCredential } = require("@azure/openai"); 

const azure_openai_endpoint = process.env["AZURE_OPENAI_API_ENDPOINT"];  
const azure_openai_api_key = process.env["AZURE_OPENAI_API_KEY"];
const azure_openai_deployment = process.env["AZURE_OPENAI_API_DEPLOYMENT_NAME"];

const azure_search_endpoint = process.env["AZURE_SEARCH_ENDPOINT"];
const azure_search_key = process.env["AZURE_SEARCH_KEY"];
const azure_search_index_name = process.env["AZURE_SEARCH_INDEX_NAME"];


// Import Functions Used
const functionProvider = require('./functions/functionProvider');

// Store conversation history in memory for demonstration purposes.  
// In a production environment, consider storing this data in a persistent store.  
let conversationHistory = [];
let rawConversationHistory = [];

function clearConversationHistory() {
    conversationHistory = [
        { role: "system", content: "" }
    ];
    rawConversationHistory = [];
}
clearConversationHistory();

function appendConversationHistory(role, content, raw) {
    conversationHistory.push({ role: role, content: content });
    rawConversationHistory.push({ role: role, content: content, raw: raw });
}

module.exports = (app) => {
    /**
     * @openapi
     * /v3/chat:
     *   post:
     *     tags:
     *     - v3
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
    app.post(`/v3/chat`, async (req, res) => {  
        const prompt = req.body.prompt;  
        if (!prompt) {  
            return res.status(400).send('Prompt is required');  
        }

        console.info(`\n\nUser Prompt:\n${prompt}`);
    
        // Add the user's prompt to the conversation history
        appendConversationHistory("user", prompt);
    
        try {  
            // https://learn.microsoft.com/javascript/api/%40azure/openai/openaiclient?view=azure-node-preview
            const chatClient = new OpenAIClient(
                azure_openai_endpoint,
                new AzureKeyCredential(azure_openai_api_key)
                );

            // const chatClient = new OpenAIClient(
            //     azure_openai_endpoint,
            //     new AzureKeyCredential(azure_openai_api_key),
            //     {
            //         apiVersion: "2024-03-01-preview"
            //     });

            // https://learn.microsoft.com/javascript/api/%40azure/openai/openaiclient
            const chatResponse = await chatClient.getChatCompletions(
                azure_openai_deployment, // deployment name
                conversationHistory, // chat request messages array
                { // getCompletionsOptions - https://learn.microsoft.com/javascript/api/%40azure/openai/getchatcompletionsoptions

                    // https://learn.microsoft.com/en-us/azure/ai-services/openai/reference#chat-completions
                    // https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/function-calling?tabs=python
                    tools: await functionProvider.getFunctionDefinition(),
                    // [
                    //     {
                    //         type: "function",
                    //         function: {
                    //             name: "downloadHtmlToMarkdown",
                    //             description: "Download the contents of a web page URL",
                    //             parameters: {
                    //                 type: "object",
                    //                 properties: {
                    //                     url: {
                    //                         type: "string",
                    //                         description: "The web page URL of the page to download, e.g. https://build5nines.com/category/page"
                    //                     }
                    //                 }
                    //             },
                    //             required: ["url"]
                    //         }
                    //     }
                    // ],
                    tool_choice: "auto", // this is the default behavior when tools are specified anyway

                    azureExtensionOptions: { //https://learn.microsoft.com/javascript/api/%40azure/openai/getchatcompletionsoptions?view=azure-node-preview#@azure-openai-getchatcompletionsoptions-azureextensionoptions
                        // https://learn.microsoft.com/en-us/javascript/api/%40azure/openai/azurechatextensionconfiguration?view=azure-node-preview
                        extensions: [
                            // https://learn.microsoft.com/en-us/javascript/api/%40azure/openai/azureextensionsoptions?view=azure-node-preview#@azure-openai-azureextensionsoptions-extensions
                            // https://github.com/MicrosoftDocs/azure-docs/blob/main/articles/ai-services/openai/references/azure-search.md
                            {
                                type: 'AzureCognitiveSearch', 
                                endpoint: azure_search_endpoint,
                                indexName: azure_search_index_name,
                                key: azure_search_key,

                                // Whether queries should be restricted to use of indexed data. Default is True.
                                in_scope: false,

                                // The query type to use with Azure Search. Default is simple
                                queryType: 'simple', // https://github.com/MicrosoftDocs/azure-docs/blob/main/articles/ai-services/openai/references/azure-search.md#query-type

                                // The configured strictness of the search relevance filtering. The higher of strictness, the higher of the precision but lower recall of the answer. Default is 3.
                                strictness: 2, // https://learn.microsoft.com/javascript/api/@azure/openai/azurecognitivesearchchatextensionconfiguration?view=azure-node-preview#@azure-openai-azurecognitivesearchchatextensionconfiguration-strictness
                                
                                // The configured top number of documents to feature for the configured query. Default is 5.
                                topNDocuments: 5, // https://learn.microsoft.com/javascript/api/@azure/openai/azurecognitivesearchchatextensionconfiguration?view=azure-node-preview#@azure-openai-azurecognitivesearchchatextensionconfiguration-topndocuments

                                // Give the model instructions about how it should behave and any context it should reference when generating a response. You can describe the assistant's personality and tell it how to format responses.
                                roleInformation: // https://learn.microsoft.com/javascript/api/@azure/openai/azurecognitivesearchchatextensionconfiguration?view=azure-node-preview#@azure-openai-azurecognitivesearchchatextensionconfiguration-roleinformation
                                    //"You are an AI assistant that helps people find information.",
                                    "You are an expert Site Reliability Engineer (SRE) and DevOps Engineer that helps people find information."
                            }
                            // Other available options: azure_cosmos_db, AzureMachineLearning, Pinecone, Elasticsearch
                            // https://github.com/MicrosoftDocs/azure-docs/blob/main/articles/ai-services/openai/references/azure-machine-learning.md
                            // https://github.com/MicrosoftDocs/azure-docs/blob/main/articles/ai-services/openai/references/pinecone.md
                            // https://github.com/MicrosoftDocs/azure-docs/blob/main/articles/ai-services/openai/references/elasticsearch.md
                            // https://github.com/MicrosoftDocs/azure-docs/blob/main/articles/ai-services/openai/references/cosmos-db.md

                        ]
                    }
                }
            );  
    
            const message = chatResponse.choices[0].message;

            console.info(`\n\ntoolCalls:\n${JSON.stringify(chatResponse.choices[0].message.toolCalls)}`);

            // Check if tool calls are present
            if (message.toolCalls && message.toolCalls.length > 0) {

                const conversationHistoryWithFunctionResults = [...conversationHistory];

                for(var toolCallIndex in message.toolCalls) {
                    const toolCall = message.toolCalls[toolCallIndex];
                    // Check if the tool call is for the downloadHtmlToMarkdown function
                    console.log('toolCall:', toolCall);
                    
                    let functionResult = await functionProvider.executeFunction(
                        toolCall.function.name,
                        toolCall.function.arguments
                    );

                    // Add the function response to the conversation history
                    conversationHistoryWithFunctionResults.push(
                        {
                            role: "function",
                            name: toolCall.function.name,
                            content: JSON.stringify(functionResult)
                        }
                    );
                }                

                try {
                    // Add the function response to the conversation history
                    //appendConversationHistory("function", JSON.stringify(functionResult), chatResponse);

                    // Re-call the chat completion API with the function's response added to the conversation history
                    const finalResponse = await chatClient.getChatCompletions(
                        azure_openai_deployment,
                        conversationHistoryWithFunctionResults
                    );

                    const systemResponse = finalResponse.choices[0].message.content;
                    appendConversationHistory("assistant", systemResponse, finalResponse);

                    console.info(`AI Response after function call:\n${systemResponse}`);
                    return res.json(finalResponse);
                } catch (functionError) {
                    console.error("Error executing downloadHtmlToMarkdown:", functionError);
                    return res.status(500).json({ error: "Failed to execute function" });
                }

            } else {
                // If no tool call, use the response directly
                const systemResponse = message.content;
                appendConversationHistory("assistant", systemResponse, chatResponse);

                console.info(`AI Response:\n${systemResponse}`);
                return res.json(chatResponse);
            }
            
        } catch (error) {  
            console.error(error);  
            // return res.status(500).send('Error processing your request'); 
            return res.status(500).json(error); 
        }  
    });

    /**
     * @openapi
     * /v3/history:
     *   get:
     *     tags:
     *     - v3
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
    app.get(`/v3/history`, async (req, res) => {
        return res.json(rawConversationHistory);
    });

    /**
     * @openapi
     * /v3/clear:
     *   get:
     *     tags:
     *     - v3
     *     description: Clear Chat History
     *     responses:
     *       200:
     *         description: Returns clear chat completion response.
     */
    app.get(`/v3/clear`, async (req, res) => {
        clearConversationHistory();
        return res.status(200).send('Chat history cleared');
    });
}