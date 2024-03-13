const { OpenAIClient, AzureKeyCredential } = require("@azure/openai"); 

const azure_openai_endpoint = process.env["AZURE_OPENAI_API_ENDPOINT"];  
const azure_openai_api_key = process.env["AZURE_OPENAI_API_KEY"];
const azure_openai_deployment = process.env["AZURE_OPENAI_API_DEPLOYMENT_NAME"]

// Store conversation history in memory for demonstration purposes.  
// In a production environment, consider storing this data in a persistent store.  
let conversationHistory = [
    { role: "system", content: "" }
];

module.exports = (app) => {
    /**
     * @openapi
     * /v1/chat:
     *   post:
     *     tags:
     *     - v1
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
    app.post(`/v1/chat`, async (req, res) => {  
        const prompt = req.body.prompt;  
        if (!prompt) {  
            return res.status(400).send('Prompt is required');  
        }  
    
        // Add the user's prompt to the conversation history  
        conversationHistory.push({ role: "user", content: prompt });  
    
        try {  
            // https://learn.microsoft.com/javascript/api/%40azure/openai/openaiclient?view=azure-node-preview
            const chatClient = new OpenAIClient(
                azure_openai_endpoint,
                new AzureKeyCredential(azure_openai_api_key)
                );

            // https://learn.microsoft.com/javascript/api/%40azure/openai/openaiclient
            const chatResponse = await chatClient.getChatCompletions(
                azure_openai_deployment,
                conversationHistory
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
     * /v1/history:
     *   get:
     *     tags:
     *     - v1
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
    app.get(`/v1/history`, async (req, res) => {
        return res.json(conversationHistory);
    });

    /**
     * @openapi
     * /v1/clear:
     *   get:
     *     tags:
     *     - v1
     *     description: Clear Chat History
     *     responses:
     *       200:
     *         description: Returns clear chat completion response.
     */
    app.get(`/v1/clear`, async (req, res) => {
        clearConversationHistory();
        return res.status(200).send('Chat history cleared');
    });
}