import { EntityUtils } from '../EntityUtils.js';


describe('EntityUtils', () => {
  test('isEqual: primitives and canonicalization (key order)', () => {
    const a = { x: 1, y: 2 };
    const b = { y: 2, x: 1 };
    expect(EntityUtils['isEqual'](a, b)).toBe(true);

    expect(EntityUtils['isEqual'](42, 42)).toBe(true);
    expect(EntityUtils['isEqual']('a', 'b')).toBe(false);
  });

  test('isEqual: Date equality by ISO string', () => {
    const d1 = new Date('2020-01-01T00:00:00.000Z');
    const d2 = new Date('2020-01-01T00:00:00.000Z');
    const d3 = new Date('2021-01-01T00:00:00.000Z');

    expect(EntityUtils['isEqual'](d1, d2)).toBe(true);
    expect(EntityUtils['isEqual'](d1, d3)).toBe(false);
  });

  test('deepDiffToDotSet: no changes -> empty object', () => {
    const orig = { a: 1, b: { c: 2 } };
    const upd = { a: 1, b: { c: 2 } };
    expect(EntityUtils.deepDiffToDotSet(orig, upd)).toEqual({});
  });

  test('deepDiffToDotSet: nested change produces dot path', () => {
    const orig = { a: { b: 1, c: 2 } };
    const upd = { a: { b: 2, c: 2 } };
    expect(EntityUtils.deepDiffToDotSet(orig, upd)).toEqual({ 'a.b': 2 });
  });

  test('deepDiffToDotSet: array changed -> set whole array', () => {
    const orig = { arr: [1, 2] };
    const upd = { arr: [1, 2, 3] };
    expect(EntityUtils.deepDiffToDotSet(orig, upd)).toEqual({ arr: [1, 2, 3] });
  });

  test('deepDiffToDotSet: property removed -> value undefined', () => {
    const orig = { x: 1, keep: 2 };
    const upd: Record<string, any> = { keep: 2 };
    expect(EntityUtils.deepDiffToDotSet(orig, upd)).toEqual({ x: undefined });
  });

  test('deepDiffToDotSet: property added', () => {
    const orig: Record<string, any> = {};
    const upd = { newProp: 5 };
    expect(EntityUtils.deepDiffToDotSet(orig, upd)).toEqual({ newProp: 5 });
  });
});