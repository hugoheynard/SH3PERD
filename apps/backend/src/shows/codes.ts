import type { TApiResponse, TApiMessage } from '@sh3pherd/shared-types';

export const ShowApiCodes = {
  SHOW_CREATED: { code: 'SHOW_CREATED', message: 'Show created successfully' },
  SHOW_UPDATED: { code: 'SHOW_UPDATED', message: 'Show updated successfully' },
  SHOW_DELETED: { code: 'SHOW_DELETED', message: 'Show deleted successfully' },
  SHOW_DUPLICATED: { code: 'SHOW_DUPLICATED', message: 'Show duplicated successfully' },
  SHOWS_FETCHED: { code: 'SHOWS_FETCHED', message: 'User shows fetched successfully' },
  SHOW_DETAIL_FETCHED: { code: 'SHOW_DETAIL_FETCHED', message: 'Show detail fetched successfully' },
  SHOW_SECTION_ADDED: { code: 'SHOW_SECTION_ADDED', message: 'Section added' },
  SHOW_SECTION_UPDATED: { code: 'SHOW_SECTION_UPDATED', message: 'Section updated' },
  SHOW_SECTION_REMOVED: { code: 'SHOW_SECTION_REMOVED', message: 'Section removed' },
  SHOW_SECTIONS_REORDERED: { code: 'SHOW_SECTIONS_REORDERED', message: 'Sections reordered' },
  SHOW_ITEM_ADDED: { code: 'SHOW_ITEM_ADDED', message: 'Item added to section' },
  SHOW_ITEM_REMOVED: { code: 'SHOW_ITEM_REMOVED', message: 'Item removed from section' },
  SHOW_ITEMS_REORDERED: { code: 'SHOW_ITEMS_REORDERED', message: 'Section items reordered' },
  SHOW_ITEM_MOVED: { code: 'SHOW_ITEM_MOVED', message: 'Item moved between sections' },
  SHOW_MARKED_PLAYED: { code: 'SHOW_MARKED_PLAYED', message: 'Show marked as played' },
  SHOW_SECTION_MARKED_PLAYED: {
    code: 'SHOW_SECTION_MARKED_PLAYED',
    message: 'Section marked as played',
  },
  SHOW_SECTION_CONVERTED_TO_PLAYLIST: {
    code: 'SHOW_SECTION_CONVERTED_TO_PLAYLIST',
    message: 'Section converted to playlist',
  },
} as const satisfies Record<string, TApiMessage>;

export function buildShowApiResponse<TResponsePayload>(
  entry: TApiMessage,
  data: TResponsePayload,
): TApiResponse<TResponsePayload> {
  return { code: entry.code, message: entry.message, data };
}
