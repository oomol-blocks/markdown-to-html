
export function validateAndCleanInput(markdown: string): string {
    if (!markdown || typeof markdown !== 'string') {
        return '';
    }
    
    // Remove potentially malicious script tags
    let cleaned = markdown.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    cleaned = cleaned.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '');
    
    const MAX_LENGTH = 104857600; // 100MB
    if (cleaned.length > MAX_LENGTH) {
        console.warn(`Input truncated from ${cleaned.length} to ${MAX_LENGTH} characters`);
        cleaned = cleaned.substring(0, MAX_LENGTH) + '\n\n[Content truncated due to length limit]';
    }
    
    return cleaned;
}

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function wrapWithHtmlDocument(content: string, defaultStyle?: boolean): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Converted Markdown</title>${defaultStyle ? getDefaultStyle() : ''}
</head>
<body>
${content}
</body>
</html>`;
}

function getDefaultStyle(): string {
    return `
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1, h2, h3, h4, h5, h6 {
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
        }
        h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 10px; }
        h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 8px; }
        h3 { font-size: 1.25em; }
        h4 { font-size: 1em; }
        h5 { font-size: 0.875em; }
        h6 { font-size: 0.85em; color: #6a737d; }
        p { margin-bottom: 16px; }
        blockquote {
            padding: 0 1em;
            color: #6a737d;
            border-left: 4px solid #dfe2e5;
            margin: 0 0 16px 0;
        }
        blockquote p { margin-bottom: 0; }
        ul, ol { padding-left: 30px; margin-bottom: 16px; }
        li { margin-bottom: 4px; }
        code {
            background-color: rgba(27,31,35,0.05);
            border-radius: 3px;
            font-size: 85%;
            margin: 0;
            padding: 0.2em 0.4em;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        }
        pre {
            background-color: #f6f8fa;
            border-radius: 6px;
            font-size: 85%;
            line-height: 1.45;
            overflow: auto;
            padding: 16px;
            margin-bottom: 16px;
        }
        pre code {
            background-color: transparent;
            border: 0;
            display: inline;
            line-height: inherit;
            margin: 0;
            overflow: visible;
            padding: 0;
            word-wrap: normal;
        }
        table {
            border-collapse: collapse;
            border-spacing: 0;
            margin-bottom: 16px;
            width: 100%;
        }
        table th, table td {
            border: 1px solid #dfe2e5;
            padding: 6px 13px;
        }
        table th {
            background-color: #f6f8fa;
            font-weight: 600;
        }
        table tr:nth-child(2n) {
            background-color: #f6f8fa;
        }
        hr {
            border: 0;
            height: 1px;
            background: #dfe2e5;
            margin: 24px 0;
        }
        img {
            max-width: 100%;
            height: auto;
        }
        a {
            color: #0366d6;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        del {
            text-decoration: line-through;
        }
    </style>`
}
