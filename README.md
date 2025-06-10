# Markdown to HTML Parser

A lightweight, TypeScript-based Markdown to HTML converter designed for the OOMOL platform. This parser provides comprehensive Markdown support with accessibility features and flexible output options.

## Features

### Core Markdown Support
- **Headers** - H1-H6 (`#` to `######`)
- **Text Formatting** - Bold (`**text**`, `__text__`), Italic (`*text*`, `_text_`), Strikethrough (`~~text~~`)
- **Lists** - Ordered (`1. item`) and Unordered (`- item`, `* item`, `+ item`)
- **Links** - `[text](url)` and `[text](url "title")`
- **Images** - `![alt](src)` and `![alt](src "title")`
- **Code** - Inline code (`` `code` ``) and code blocks (` ```lang `)
- **Blockquotes** - `> quote text`
- **Tables** - Full table support with alignment
- **Horizontal Rules** - `---` or `***`
- **Paragraphs** - Automatic paragraph wrapping

### Advanced Features
- **Inline List Processing** - Supports single-line list formats like `1. Item A 2. Item B 3. Item C`
- **Multi-line Support** - Handles both traditional multi-line and inline Markdown formats
- **HTML Escaping** - Automatic escaping of HTML characters in code blocks
- **Error Handling** - Graceful error handling with informative error messages
- **Flexible Output** - Optional HTML document wrapping with default styling

## Usage

### With HTML Document Wrapper

```typescript
const params = {
    markdownText: "# My Document\n\nContent here.",
    wrapWithHtml: true,
    defaultStyle: true
};

const result = // running with this shared block
// Returns a complete HTML document with default styling
```

## Input Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `markdownText` | `string` | - | The Markdown text to convert |
| `wrapWithHtml` | `boolean` | `false` | Whether to wrap output in complete HTML document |
| `defaultStyle` | `boolean` | `false` | Whether to include default CSS styling (requires `wrapWithHtml: true`) |

## Output

Returns an object with:
- `htmlText` - The converted HTML string

## Supported Markdown Examples

### Headers
```markdown
# H1 Header
## H2 Header
### H3 Header
#### H4 Header
##### H5 Header
###### H6 Header
```

### Text Formatting
```markdown
**Bold text** or __Bold text__
*Italic text* or _Italic text_
~~Strikethrough text~~
`Inline code`
```

### Lists

#### Traditional Format
```markdown
1. First item
2. Second item
3. Third item

- Unordered item
- Another item
- Third item
```

#### Inline Format (Special Feature)
```markdown
1. First item 2. Second item 3. Third item
- Item A - Item B - Item C
```

### Links and Images
```markdown
[Link text](https://example.com)
[Link with title](https://example.com "Title")
![Image alt](image.jpg)
![Image with title](image.jpg "Image title")
```

### Code Blocks
````markdown
```javascript
function hello() {
    console.log("Hello World!");
}
```
````

### Tables
```markdown
| Header 1 | Header 2 | Header 3 |
|----------|:--------:|---------:|
| Left     | Center   | Right    |
| Align    | Align    | Align    |
```

### Blockquotes
```markdown
> This is a blockquote
> It can span multiple lines
```

### Horizontal Rules
```markdown
---
***
```

## Error Handling

The parser includes comprehensive error handling:

- Invalid input validation
- Graceful failure with error messages
- HTML escaping to prevent XSS attacks
- Fallback error HTML output

```typescript
// If parsing fails, returns:
{
    htmlText: "<p>Error: Unable to convert markdown content. [Error details]</p>"
}
```

## Processing Order

The parser processes Markdown elements in a specific order to avoid conflicts:

1. Code blocks (to preserve content)
2. Headers
3. Horizontal rules
4. Blockquotes
5. Lists
6. Bold text
7. Italic text
8. Strikethrough
9. Inline code
10. Links
11. Images
12. Tables
13. Paragraphs

## Architecture

### Main Functions

- `markdownToHtml()` - Main conversion function
- `processLists()` - Advanced list processing with inline support
- `processCodeBlocks()` - Code block processing with language support
- `processTables()` - Complete table processing with alignment
- Individual processors for each Markdown element

### Utility Functions

- `validateAndCleanInput()` - Input validation and sanitization
- `escapeHtml()` - HTML character escaping
- `wrapWithHtmlDocument()` - HTML document wrapper

## Performance Considerations

- Single-pass processing for most elements
- Efficient regex patterns
- Minimal DOM manipulation
