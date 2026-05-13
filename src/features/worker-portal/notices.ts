import type { WorkerNoticeDetail, WorkerNoticeSummary } from '@/types/domain';

export const NOTICE_NAVY = '#2E338C';
export const NOTICE_GREEN = '#03A64A';
export const NOTICE_CRIMSON = '#A6121F';
export const NOTICE_RED = '#F21D2F';
export const NOTICE_LIGHT = '#F2F2F2';

export function getNoticeTheme(theme: WorkerNoticeSummary['theme']) {
  switch (theme) {
    case 'green':
      return {
        accent: NOTICE_GREEN,
        soft: 'rgba(3, 166, 74, 0.10)',
        border: 'rgba(3, 166, 74, 0.20)',
      };
    case 'crimson':
      return {
        accent: NOTICE_CRIMSON,
        soft: 'rgba(166, 18, 31, 0.08)',
        border: 'rgba(166, 18, 31, 0.20)',
      };
    case 'red':
      return {
        accent: NOTICE_RED,
        soft: 'rgba(242, 29, 47, 0.08)',
        border: 'rgba(242, 29, 47, 0.18)',
      };
    case 'navy':
    default:
      return {
        accent: NOTICE_NAVY,
        soft: 'rgba(46, 51, 140, 0.08)',
        border: 'rgba(46, 51, 140, 0.18)',
      };
  }
}

export function formatNoticeDate(value: string, language: string) {
  try {
    return new Intl.DateTimeFormat(language.startsWith('ur') ? 'ur-PK' : 'en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function getNoticeTitle(notice: WorkerNoticeSummary | WorkerNoticeDetail, language: string) {
  return language.startsWith('ur') ? notice.title_ur : notice.title_en;
}

export function getNoticeExcerpt(notice: WorkerNoticeSummary | WorkerNoticeDetail, language: string) {
  return language.startsWith('ur') ? notice.excerpt_ur : notice.excerpt_en;
}

export function getNoticeBody(notice: WorkerNoticeDetail, language: string) {
  return language.startsWith('ur') ? notice.body_ur : notice.body_en;
}

export function getNoticeAuthor(notice: WorkerNoticeDetail, language: string) {
  return language.startsWith('ur') ? notice.author_label_ur : notice.author_label_en;
}

export function getNoticeSourceLabel(notice: WorkerNoticeDetail, language: string) {
  return language.startsWith('ur') ? notice.source_label_ur : notice.source_label_en;
}

export function getNoticeRegion(notice: WorkerNoticeSummary | WorkerNoticeDetail, language: string) {
  return language.startsWith('ur') ? notice.region_label_ur : notice.region_label_en;
}

export function getNoticeCtaLabel(notice: WorkerNoticeDetail, language: string) {
  if (!notice.cta_label_en || !notice.cta_label_ur) {
    return undefined;
  }

  return language.startsWith('ur') ? notice.cta_label_ur : notice.cta_label_en;
}

export function getNoticeTags(notice: WorkerNoticeDetail, language: string) {
  return language.startsWith('ur') ? notice.tags_ur : notice.tags_en;
}
