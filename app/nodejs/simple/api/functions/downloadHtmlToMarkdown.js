const axios = require('axios');
const cheerio = require('cheerio');
const turndown = require('turndown');

async function downloadHtmlToMarkdown(url) {
    try {
        // Fetch HTML content from the URL
        const response = await axios.get(url);
        const html = response.data;

        // Load HTML into Cheerio
        const $ = cheerio.load(html);

        // Initialize Turndown converter
        const turndownService = new turndown();

        // Convert HTML to Markdown
        const markdown = turndownService.turndown($.html());

        return markdown;
    } catch (error) {
        console.error('downloadHtmlToMarkdown Error:', error);
        throw error;
    }
}

module.exports = downloadHtmlToMarkdown;