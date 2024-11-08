const downloadHtmlToMarkdown = require('./downloadHtmlToMarkdown');

async function searchGoogle(query) {
    try {
        const url = `https://www.google.com/search?q=${query}`;

        let markdown = await downloadHtmlToMarkdown(url);

        var maxLength = 15 * 1024;
        if (markdown.length > maxLength) {
            markdown = markdown.substring(0, maxLength);
        }
        
        console.log('searchGoogle Results:', markdown);

        return markdown;
    } catch (error) {
        console.error('searchGoogle Error:', error);
        throw error;
    }
}

module.exports = searchGoogle;