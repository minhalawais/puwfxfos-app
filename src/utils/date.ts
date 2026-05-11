import i18n from '@/i18n';

/**
 * Formats a date string into a localized, human-readable format.
 * Defaults to 'DD MMM YYYY' for English and appropriate Urdu formatting.
 */
export function formatDate(dateString: string | undefined | null) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const isUrdu = i18n.language?.startsWith('ur');
  const locale = isUrdu ? 'ur-PK' : 'en-GB';

  try {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch (error) {
    console.warn('Date formatting failed:', error);
    return dateString;
  }
}

/**
 * Formats a date string into a relative format if close, or absolute if far.
 * Useful for deadlines and expiries.
 */
export function formatRelativeDate(dateString: string | undefined | null) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const now = new Date();
  const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const isUrdu = i18n.language?.startsWith('ur');

  if (diffInDays === 0) return isUrdu ? 'آج' : 'Today';
  if (diffInDays === 1) return isUrdu ? 'کل' : 'Tomorrow';
  if (diffInDays === -1) return isUrdu ? 'گزشتہ روز' : 'Yesterday';
  
  if (diffInDays > 0 && diffInDays < 7) {
    return isUrdu ? `${diffInDays} دنوں میں` : `In ${diffInDays} days`;
  }

  return formatDate(dateString);
}
