import { describe, expect, it } from 'vitest';
import { classifyLayoutWidth } from './useResponsiveness';

describe('classifyLayoutWidth', () => {
  it('classifies only legacy sub-320px viewports as compact', () => {
    expect(classifyLayoutWidth(0)).toBe('compact');
    expect(classifyLayoutWidth(319)).toBe('compact');
  });

  it('classifies standard phones and tablets as medium', () => {
    expect(classifyLayoutWidth(320)).toBe('medium');
    expect(classifyLayoutWidth(375)).toBe('medium');
    expect(classifyLayoutWidth(390)).toBe('medium');
    expect(classifyLayoutWidth(430)).toBe('medium');
    expect(classifyLayoutWidth(639)).toBe('medium');
    expect(classifyLayoutWidth(640)).toBe('medium');
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
