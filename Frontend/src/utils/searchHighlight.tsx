import React from 'react';

export const highlightSearchTerm = (text: string, searchTerm: string): React.ReactNode => {
  if (!searchTerm || !text) return text;

  const regex = new RegExp(`(${searchTerm})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-200 text-gray-900 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};

export const highlightSearchTermHTML = (html: string, searchTerm: string): string => {
  if (!searchTerm || !html) return html;

  // Sanitize search term to prevent ReDoS attacks
  const sanitizedSearchTerm = searchTerm
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape regex special characters
    .substring(0, 100); // Limit length to prevent ReDoS

  // Remove HTML tags temporarily for search
  const textContent = html.replace(/<[^>]*>/g, '');
  if (!textContent.toLowerCase().includes(sanitizedSearchTerm.toLowerCase())) {
    return html;
  }

  // Simple highlight - wrap matching text in mark tags
  const regex = new RegExp(`(${sanitizedSearchTerm})`, 'gi');
  return html.replace(regex, '<mark class="bg-yellow-200 text-gray-900 px-0.5 rounded">$1</mark>');
};

