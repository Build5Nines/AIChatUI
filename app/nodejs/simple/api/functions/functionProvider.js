const downloadHtmlToMarkdown = require('./downloadHtmlToMarkdown');
const searchGoogle = require('./searchGoogle');

//async function functionProvider() {
//    return {
const functionProvider = {
        getFunctionDefinition: async () => {
            return [
                {
                    type: "function",
                    function: {
                        name: "downloadHtmlToMarkdown",
                        description: "Download the contents of a web page URL",
                        parameters: {
                            type: "object",
                            properties: {
                                url: {
                                    type: "string",
                                    description: "The web page URL of the page to download, e.g. https://build5nines.com/category/page"
                                }
                            }
                        },
                        required: ["url"]
                    }
                },
                {
                    type: "function",
                    function: {
                        name: "searchGoogle",
                        description: "Search Google for information",
                        parameters: {
                            type: "object",
                            properties: {
                                query: {
                                    type: "string",
                                    description: "The search query to use, e.g. Azure Functions"
                                }
                            }
                        }
                    }
                }
            ];
        },
        executeFunction: async (functionName, arguments) => {
            let functionResult = null;

            switch (functionName) {
                case "downloadHtmlToMarkdown":
                    const { url } = JSON.parse(arguments);
            
                    // Call the downloadHtmlToMarkdown function and get the result
                    functionResult = await downloadHtmlToMarkdown(url);
                    break;
            
                case "searchGoogle":
                    const { query } = JSON.parse(arguments);
            
                    // Call the searchGoogle function and get the result
                    functionResult = await searchGoogle(query);
                    break;
            
                default:
                    console.error("Unsupported Function Call:", functionName);
            }

            return functionResult;
        }
    };

module.exports = functionProvider;