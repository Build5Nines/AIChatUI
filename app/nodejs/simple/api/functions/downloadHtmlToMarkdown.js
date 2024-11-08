const axios = require('axios');
const cheerio = require('cheerio');
const turndown = require('turndown');

async function downloadHtmlToMarkdown(url) {
    try {
        console.log('downloadHtmlToMarkdown URL:', url);

        // Fetch HTML content from the URL
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
            }
        });
        const html = response.data;

        // Load HTML into Cheerio
        const $ = cheerio.load(html);

        // Remove unwanted elements
        $('script').remove();
        $('style').remove();

        // Initialize Turndown converter
        const turndownService = new turndown();

        // Convert HTML to Markdown
        const markdown = turndownService.turndown($.html());

        console.log('downloadHtmlToMarkdown Results:', markdown);

        return markdown;
    } catch (error) {
        console.error('downloadHtmlToMarkdown Error:', error);
        throw error;
    }
}

module.exports = downloadHtmlToMarkdown;