// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useInitials } from '@/hooks/use-initials';

afterEach(cleanup);

describe('useInitials', () => {
    it.each([
        ['', ''],
        [' \t\n ', ''],
        ['Daniel', 'D'],
        ['  María  del Carmen  ', 'MC'],
        ['María\tLópez', 'ML'],
        ['José\nÁlvarez', 'JÁ'],
        ['Jose\u0301 A\u0301lvarez', 'JÁ'],
        ['𐐨lex 𐐺rown', '𐐀𐐒'],
        ['王 小明', '王小'],
    ])('returns complete initials for %j', (name, expected) => {
        const { result } = renderHook(() => useInitials());
        expect(result.current(name)).toBe(expected);
    });
});
