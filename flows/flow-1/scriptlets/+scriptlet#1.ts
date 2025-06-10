import { validateAndCleanInput, escapeHtml, wrapWithHtmlDocument } from "./utils"

//#region generated meta
import type { Context } from "@oomol/types/oocana";
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
