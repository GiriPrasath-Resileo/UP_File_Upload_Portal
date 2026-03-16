import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fmtDate,
  fmtDateTime,
  fmtRelative,
  fmtEnum,
  fmtBytes,
  buildCsvRows,
  downloadCsv,
} from './formatters';

describe('formatters', () => {
  describe('fmtDate', () => {
    it('formats date string', () => {
      expect(fmtDate('2024-03-15')).toBe('15 Mar 2024');
    });
    it('formats Date object', () => {
      expect(fmtDate(new Date('2024-01-01'))).toBe('01 Jan 2024');
    });
  });

  describe('fmtDateTime', () => {
    it('formats date and time', () => {
      const result = fmtDateTime('2024-03-15T14:30:00');
      expect(result).toMatch(/\d{2} Mar 2024, \d{2}:\d{2}/);
    });
  });

  describe('fmtRelative', () => {
    it('returns relative time string', () => {
      const past = new Date(Date.now() - 60000);
      expect(fmtRelative(past)).toMatch(/ago|minute/);
    });
  });

  describe('fmtEnum', () => {
    it('replaces underscores with spaces and capitalizes first letter of each word', () => {
      expect(fmtEnum('some_value')).toBe('Some Value');
    });
    it('handles single word - capitalizes first letter', () => {
      expect(fmtEnum('hindi')).toBe('Hindi');
    });
    it('keeps already-uppercase words as-is (first letter stays upper)', () => {
      expect(fmtEnum('SOME_VALUE')).toBe('SOME VALUE');
    });
  });

  describe('fmtBytes', () => {
    it('returns 0 B for zero', () => {
      expect(fmtBytes(0)).toBe('0 B');
    });
    it('formats bytes', () => {
      expect(fmtBytes(500)).toBe('500 B');
    });
    it('formats KB', () => {
      expect(fmtBytes(1024)).toBe('1 KB');
    });
    it('formats MB', () => {
      expect(fmtBytes(1024 * 1024)).toBe('1 MB');
    });
    it('formats GB', () => {
      expect(fmtBytes(1024 * 1024 * 1024)).toBe('1 GB');
    });
    it('formats fractional values', () => {
      expect(fmtBytes(1536)).toBe('1.5 KB');
    });
  });

  describe('buildCsvRows', () => {
    it('builds CSV with header and rows', () => {
      const data = [{ name: 'Alice', age: 25 }, { name: 'Bob', age: 30 }];
      const columns = [{ key: 'name' as const, header: 'Name' }, { key: 'age' as const, header: 'Age' }];
      const result = buildCsvRows(data, columns);
      expect(result).toBe('Name,Age\nAlice,25\nBob,30');
    });
    it('escapes commas in values', () => {
      const data = [{ name: 'Doe, John', age: 25 }];
      const columns = [{ key: 'name' as const, header: 'Name' }, { key: 'age' as const, header: 'Age' }];
      const result = buildCsvRows(data, columns);
      expect(result).toContain('"Doe, John"');
    });
    it('handles null/undefined as empty string', () => {
      const data = [{ name: null, age: undefined } as Record<string, unknown>];
      const columns = [{ key: 'name' as const, header: 'Name' }, { key: 'age' as const, header: 'Age' }];
      const result = buildCsvRows(data, columns);
      expect(result).toBe('Name,Age\n,');
    });
  });

  describe('downloadCsv', () => {
    let createObjectURL: ReturnType<typeof vi.fn>;
    let revokeObjectURL: ReturnType<typeof vi.fn>;
    let createElement: typeof document.createElement;
    let clickSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      createObjectURL = vi.fn(() => 'blob:mock-url');
      revokeObjectURL = vi.fn();
      clickSpy = vi.fn();
      createElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        const el = createElement(tagName);
        if (tagName === 'a') {
          el.click = clickSpy;
        }
        return el;
      });
      global.URL.createObjectURL = createObjectURL;
      global.URL.revokeObjectURL = revokeObjectURL;
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('creates blob and triggers download', () => {
      downloadCsv('a,b\n1,2', 'test.csv');
      expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
      expect(clickSpy).toHaveBeenCalled();
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });
});
