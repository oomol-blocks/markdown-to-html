import type { Context } from '@oomol/types/oocana';

//#region generated meta
type Inputs = {
    markdownText: string;
    wrapWithHtml: boolean;
    defaultStyle: boolean;
};
type Outputs = {
    htmlText: string;
};
//#endregion

export default async function(
    params: Inputs,
    context: Context<Inputs, Outputs>
): Promise<Partial<Outputs> | undefined | void> {
    try {
        const { markdownText, wrapWithHtml = false, defaultStyle = false } = params;
        
        const cleanMarkdown = validateAndCleanInput(markdownText);
        const htmlContent = markdownToHtml(cleanMarkdown);
        
        const htmlOutput = wrapWithHtml ? wrapWithHtmlDocument(htmlContent, defaultStyle) : htmlContent;

        return { htmlText: htmlOutput };
    } catch (error) {
        console.error('Markdown conversion failed:', error);
        const errorMessage = `<p>Error: Unable to convert markdown content. ${error.message}</p>`;
        const htmlOutput = params.wrapWithHtml ? wrapWithHtmlDocument(errorMessage) : errorMessage;
        return { htmlText: htmlOutput };
    }
};

/**
 * Convert markdown text to HTML format
 */
function markdownToHtml(markdown: string): string {
    if (!markdown || typeof markdown !== 'string') {
        return '';
    }

    let html = markdown;

    html = processCodeBlocks(html);
    html = processHeaders(html);
    html = processHorizontalRules(html);
    html = processBlockquotes(html);
    html = processLists(html);
    html = processBoldText(html);
    html = processItalicText(html);
    html = processStrikethrough(html);
    html = processInlineCode(html);
    html = processLinks(html);
    html = processImages(html);
    html = processTables(html);
    html = processParagraphs(html);

    return html;
}

/**
 * Process code blocks with optional language specification
 */
function processCodeBlocks(html: string): string {
    return html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const language = lang ? ` class="language-${lang}"` : '';
        return `<pre><code${language}>${escapeHtml(code.trim())}</code></pre>`;
    });
}

/**
 * Process markdown headers (h1-h6)
 */
function processHeaders(html: string): string {
    html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
    html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
    return html;
}

/**
 * Process horizontal rules (--- or ***)
 */
function processHorizontalRules(html: string): string {
    html = html.replace(/^---+$/gm, '<hr>');
    html = html.replace(/^\*\*\*+$/gm, '<hr>');
    return html;
}

/**
 * Process blockquotes (> text)
 */
function processBlockquotes(html: string): string {
    return html.replace(/^>\s+(.+)$/gm, '<blockquote><p>$1</p></blockquote>');
}

/**
 * Process ordered and unordered lists (supports multi-line and inline items)
 */
function processLists(html: string): string {
    // Process ordered lists (supports multi-line and inline items)
    html = html.replace(/^(\d+\.\s+.+(?:\s+\d+\.\s+.+)*(?:\n\d+\.\s+.+(?:\s+\d+\.\s+.+)*)*)/gm, (match) => {
        const items: string[] = [];
        
        // Split by lines
        const lines = match.split('\n');
        
        lines.forEach(line => {
            // Find all ordered list items in each line (supports inline multiple items)
            const itemMatches = line.match(/\d+\.\s*[^0-9]+?(?=\d+\.|$)/g);
            if (itemMatches) {
                itemMatches.forEach(item => {
                    const itemMatch = item.match(/^\d+\.\s*(.+)$/);
                    if (itemMatch) {
                        items.push(`<li>${itemMatch[1].trim()}</li>`);
                    }
                });
            }
        });
        
        return items.length > 0 ? `<ol>\n${items.join('\n')}\n</ol>` : match;
    });

    // Process unordered lists (supports multi-line and inline items)
    html = html.replace(/^([-*+]\s+.+(?:\s+[-*+]\s+.+)*(?:\n[-*+]\s+.+(?:\s+[-*+]\s+.+)*)*)/gm, (match) => {
        const items: string[] = [];
        
        // Split by lines
        const lines = match.split('\n');
        
        lines.forEach(line => {
            // Find all unordered list items in each line (supports inline multiple items)
            const itemMatches = line.match(/[-*+]\s*[^-*+]+?(?=[-*+]|$)/g);
            if (itemMatches) {
                itemMatches.forEach(item => {
                    const itemMatch = item.match(/^[-*+]\s*(.+)$/);
                    if (itemMatch) {
                        items.push(`<li>${itemMatch[1].trim()}</li>`);
                    }
                });
            }
        });
        
        return items.length > 0 ? `<ul>\n${items.join('\n')}\n</ul>` : match;
    });

    return html;
}

/**
 * Process bold text (**text** or __text__)
 */
function processBoldText(html: string): string {
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
    return html;
}

/**
 * Process italic text (*text* or _text_)
 */
function processItalicText(html: string): string {
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');
    return html;
}

/**
 * Process strikethrough text (~~text~~)
 */
function processStrikethrough(html: string): string {
    return html.replace(/~~(.*?)~~/g, '<del>$1</del>');
}

/**
 * Process inline code (`code`)
 */
function processInlineCode(html: string): string {
    return html.replace(/`([^`]+)`/g, '<code>$1</code>');
}

/**
 * Process links ([text](url) or [text](url "title"))
 */
function processLinks(html: string): string {
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\s+"([^"]+)"\)/g, '<a href="$2" title="$3">$1</a>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    return html;
}

/**
 * Process images (![alt](src) or ![alt](src "title"))
 */
function processImages(html: string): string {
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\s+"([^"]+)"\)/g, '<img src="$2" alt="$1" title="$3">');
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
    return html;
}

/**
 * Process markdown tables
 */
function processTables(html: string): string {
    const tableRegex = /(\|.+\|\n\|[-:| ]+\|\n(?:\|.+\|\n?)*)/g;
    
    return html.replace(tableRegex, (match) => {
        const lines = match.trim().split('\n');
        if (lines.length < 2) return match;
        
        const headerRow = lines[0];
        const separatorRow = lines[1];
        const dataRows = lines.slice(2);
        
        return buildTableHtml(headerRow, separatorRow, dataRows);
    });
}

/**
 * Build complete HTML table structure
 */
function buildTableHtml(headerRow: string, separatorRow: string, dataRows: string[]): string {
    const headers = parseTableRow(headerRow);
    
    const alignments = parseTableAlignments(separatorRow);
    
    let tableHtml = '<table>\n';
    tableHtml += buildTableHeader(headers, alignments);
    tableHtml += buildTableBody(dataRows, alignments);
    tableHtml += '</table>';
    
    return tableHtml;
}

/**
 * Parse table row and extract cells
 */
function parseTableRow(row: string): string[] {
    return row.split('|').slice(1, -1).map(cell => cell.trim());
}

/**
 * Parse table alignment specifications from separator row
 */
function parseTableAlignments(separatorRow: string): string[] {
    return separatorRow.split('|').slice(1, -1).map(sep => {
        const trimmed = sep.trim();
        if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
        if (trimmed.endsWith(':')) return 'right';
        return 'left';
    });
}

/**
 * Build table header HTML with alignment styles
 */
function buildTableHeader(headers: string[], alignments: string[]): string {
    let headerHtml = '<thead>\n<tr>\n';
    headers.forEach((header, i) => {
        const align = alignments[i] ? ` style="text-align: ${alignments[i]}"` : '';
        headerHtml += `<th${align}>${header}</th>\n`;
    });
    headerHtml += '</tr>\n</thead>\n';
    return headerHtml;
}

/**
 * Build table body HTML with alignment styles
 */
function buildTableBody(dataRows: string[], alignments: string[]): string {
    let bodyHtml = '<tbody>\n';
    dataRows.forEach(row => {
        const cells = parseTableRow(row);
        bodyHtml += '<tr>\n';
        cells.forEach((cell, i) => {
            const align = alignments[i] ? ` style="text-align: ${alignments[i]}"` : '';
            bodyHtml += `<td${align}>${cell}</td>\n`;
        });
        bodyHtml += '</tr>\n';
    });
    bodyHtml += '</tbody>\n';
    return bodyHtml;
}

/**
 * Process paragraphs (separated by double line breaks)
 */
function processParagraphs(html: string): string {
    // Process paragraphs (separated by double line breaks)
    const paragraphs = html.split(/\n\s*\n/);
    html = paragraphs.map(paragraph => {
        paragraph = paragraph.trim();
        if (!paragraph) return '';
        
        // Skip content that's already HTML tags
        if (paragraph.match(/^<(h[1-6]|hr|blockquote|ul|ol|pre|table)/)) {
            return paragraph;
        }
        
        // Process regular paragraphs
        return `<p>${paragraph.replace(/\n/g, '<br>')}</p>`;
    }).filter(p => p).join('\n\n');
    
    return html;
}


function validateAndCleanInput(markdown: string): string {
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
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function wrapWithHtmlDocument(content: string, defaultStyle?: boolean): string {
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