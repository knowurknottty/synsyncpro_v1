import { describe, expect, it } from 'vitest';
import { classifyLayoutWidth } from './useResponsiveness';

describe('classifyLayoutWidth', () => {
  it('classifies phones as compact (mobile drawer shell)', () => {
    expect(classifyLayoutWidth(0)).toBe('compact');
    expect(classifyLayoutWidth(319)).toBe('compact');
    expect(classifyLayoutWidth(320)).toBe('compact');
    expect(classifyLayoutWidth(375)).toBe('compact');
    expect(classifyLayoutWidth(390)).toBe('compact');
    expect(classifyLayoutWidth(430)).toBe('compact');
    expect(classifyLayoutWidth(767)).toBe('compact');
  });

  it('classifies tablets as medium', () => {
    expect(classifyLayoutWidth(768)).toBe('medium');
    expect(classifyLayoutWidth(1024)).toBe('medium');
    expect(classifyLayoutWidth(1099)).toBe('medium');
  });

  it('classifies cockpit viewports', () => {
    expect(classifyLayoutWidth(1100)).toBe('cockpit');
    expect(classifyLayoutWidth(1280)).toBe('cockpit');
    expect(classifyLayoutWidth(1440)).toBe('cockpit');
    expect(classifyLayoutWidth(1728)).toBe('cockpit');
  });
});
