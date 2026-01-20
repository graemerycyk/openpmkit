'use client';

import { useMemo } from 'react';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * Renders markdown content with proper styling for agent outputs.
 * Handles headings, lists, links, bold/italic, horizontal rules, and citation references.
 */
export function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  const html = useMemo(() => renderMarkdown(content), [content]);

  return (
    <div
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function renderMarkdown(content: string): string {
  // Process line by line to handle block elements properly
  const lines = content.split('\n');
  const result: string[] = [];
  let inList = false;
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      result.push(`<ul class="my-3 ml-4 space-y-1.5">${listItems.join('')}</ul>`);
      listItems = [];
    }
    inList = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Horizontal rule
    if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) {
      flushList();
      result.push('<hr class="my-6 border-t border-border" />');
      continue;
    }

    // Headings (h1-h4)
    const h1Match = line.match(/^# (.+)$/);
    if (h1Match) {
      flushList();
      result.push(`<h1 class="text-xl font-bold mt-8 mb-4 first:mt-0">${processInline(h1Match[1])}</h1>`);
      continue;
    }

    const h2Match = line.match(/^## (.+)$/);
    if (h2Match) {
      flushList();
      result.push(`<h2 class="text-lg font-semibold mt-6 mb-3 text-foreground">${processInline(h2Match[1])}</h2>`);
      continue;
    }

    const h3Match = line.match(/^### (.+)$/);
    if (h3Match) {
      flushList();
      result.push(`<h3 class="text-base font-semibold mt-5 mb-2 text-foreground">${processInline(h3Match[1])}</h3>`);
      continue;
    }

    const h4Match = line.match(/^#### (.+)$/);
    if (h4Match) {
      flushList();
      result.push(`<h4 class="text-sm font-semibold mt-4 mb-2 text-foreground/90">${processInline(h4Match[1])}</h4>`);
      continue;
    }

    // List items (- or *)
    const listMatch = line.match(/^[-*]\s+(.+)$/);
    if (listMatch) {
      inList = true;
      listItems.push(`<li class="text-sm leading-relaxed text-muted-foreground">${processInline(listMatch[1])}</li>`);
      continue;
    }

    // If we were in a list and hit a non-list line, flush
    if (inList && line.trim() !== '') {
      flushList();
    }

    // Empty line
    if (line.trim() === '') {
      if (inList) {
        flushList();
      }
      // Don't add excessive breaks
      if (result.length > 0 && !result[result.length - 1].includes('<br')) {
        result.push('<div class="h-3"></div>');
      }
      continue;
    }

    // Regular paragraph
    flushList();
    result.push(`<p class="text-sm leading-relaxed text-muted-foreground mb-2">${processInline(line)}</p>`);
  }

  // Flush any remaining list
  flushList();

  return result.join('');
}

function processInline(text: string): string {
  let result = text;

  // Escape HTML but keep our processed elements
  result = result
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Bold text (**text**)
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');

  // Italic text (*text*)
  result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Underlined text (__text__ - often used for emphasis in these outputs)
  result = result.replace(/__([^_]+)__/g, '<span class="underline decoration-1 underline-offset-2">$1</span>');

  // Links [text](url)
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-cobalt-600 hover:text-cobalt-700 hover:underline">$1</a>'
  );

  // Citation references like [1], [2], [1][2][3]
  // Style them as small superscript badges
  result = result.replace(
    /\[(\d+)\]/g,
    '<sup class="inline-flex items-center justify-center min-w-[1.25rem] h-4 px-1 ml-0.5 text-[10px] font-medium bg-muted text-muted-foreground rounded">$1</sup>'
  );

  // Inline code `code`
  result = result.replace(
    /`([^`]+)`/g,
    '<code class="px-1.5 py-0.5 text-xs bg-muted rounded font-mono">$1</code>'
  );

  // User mentions like <@U0A9JLWFFK8> - style them nicely
  result = result.replace(
    /&lt;@([A-Z0-9]+)&gt;/g,
    '<span class="inline-flex items-center px-1.5 py-0.5 text-xs bg-cobalt-100 text-cobalt-700 dark:bg-cobalt-900/30 dark:text-cobalt-400 rounded font-medium">@$1</span>'
  );

  // Channel mentions like #channel-name
  result = result.replace(
    /#([a-z0-9\-_]+)/gi,
    '<span class="inline-flex items-center px-1.5 py-0.5 text-xs bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded font-medium">#$1</span>'
  );

  return result;
}
