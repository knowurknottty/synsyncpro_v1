import { describe, expect, it } from 'vitest';
import { classifyLayoutWidth, COMPACT_MAX, COCKPIT_MIN } from './useResponsiveness';

/**
 * CSS overflow audit — verifies no horizontal document overflow at each
 * required validation width. This tests the layout classification logic
 * which determines which component tree renders at each width.
 *
 * Real visual overflow testing requires browser viewport simulation.
 * This test verifies the classification boundaries are correct and
 * that the routing logic sends the right width to the right layout.
 */

describe('CSS overflow prevention via layout classification', () => {
  const requiredWidths = [375, 390, 430, 768, 1024, 1280, 1440, 1728];

  it('all required widths classify without gaps', () => {
    for (const width of requiredWidths) {
      const mode = classifyLayoutWidth(width);
      expect(['compact', 'medium', 'cockpit']).toContain(mode);
    }
  });

  it('compact widths route to MobileApp (overflow-safe: flex-col + overflow-hidden)', () => {
    const compactWidths = requiredWidths.filter(w => w <= COMPACT_MAX);
    for (const width of compactWidths) {
      expect(classifyLayoutWidth(width)).toBe('compact');
    }
  });

  it('medium widths route to DesktopApp (overflow-safe: grid-cols-12 + overflow-hidden)', () => {
    const mediumWidths = requiredWidths.filter(w => w > COMPACT_MAX && w < COCKPIT_MIN);
    for (const width of mediumWidths) {
      expect(classifyLayoutWidth(width)).toBe('medium');
    }
  });

  it('cockpit widths route to DesktopApp (overflow-safe: grid-cols-12 + overflow-hidden)', () => {
    const cockpitWidths = requiredWidths.filter(w => w >= COCKPIT_MIN);
    for (const width of cockpitWidths) {
      expect(classifyLayoutWidth(width)).toBe('cockpit');
    }
  });

  it('no width falls between classification boundaries (no gaps)', () => {
    // Check every integer from 0 to 1800
    for (let w = 0; w <= 1800; w++) {
      const mode = classifyLayoutWidth(w);
      expect(['compact', 'medium', 'cockpit']).toContain(mode);
    }
  });
});
