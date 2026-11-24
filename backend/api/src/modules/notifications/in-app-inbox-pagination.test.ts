import { describe, expect, it } from 'vitest';
import { decodeInboxCursor, encodeInboxCursor, groupInboxRows, parseInboxLimit } from './in-app-inbox-pagination.js';
describe('in-app inbox paging and grouping', () => {
  it('clamps page size and defaults invalid values', () => { expect(parseInboxLimit('250')).toBe(100); expect(parseInboxLimit('0')).toBe(1); expect(parseInboxLimit('x')).toBe(50); });
  it('round trips valid cursors and rejects malformed data', () => { const cursor = { createdAt: '2026-11-22T09:00:00.000Z', id: 'row-1' }; expect(decodeInboxCursor(encodeInboxCursor(cursor))).toEqual(cursor); expect(decodeInboxCursor('bad')).toBeNull(); expect(decodeInboxCursor('')).toBeNull(); });
  it('groups rows by category with a general fallback', () => { const groups = groupInboxRows([{category:'ATTENDANCE',id:1},{category:'ATTENDANCE',id:2},{id:3}]); expect(groups).toEqual([{category:'ATTENDANCE',count:2,items:[{category:'ATTENDANCE',id:1},{category:'ATTENDANCE',id:2}]},{category:'GENERAL',count:1,items:[{id:3}]}]); });
});
