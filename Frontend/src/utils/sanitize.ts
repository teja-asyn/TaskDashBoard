import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param dirty - Unsanitized HTML string
 * @returns Sanitized HTML string safe for dangerouslySetInnerHTML
 */
export const sanitizeHTML = (dirty: string | null | undefined): string => {
  if (!dirty) {
    return '';
  }

  // Configure DOMPurify to allow safe HTML formatting
  const config = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'span', 'div'
    ],
    ALLOWED_ATTR: ['href', 'class', 'style'],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  };

  return DOMPurify.sanitize(dirty, config);
};

/**
 * Sanitize plain text to prevent XSS when displaying
 * @param text - Text to sanitize
 * @returns Sanitized text
 */
export const sanitizeText = (text: string | null | undefined): string => {
  if (!text) {
    return '';
  }

  // Remove all HTML tags and escape special characters
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
};

