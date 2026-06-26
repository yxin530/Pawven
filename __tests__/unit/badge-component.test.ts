import { getCategoryColor } from '@/components/ui/Badge';

describe('Badge Component - getCategoryColor', () => {
  describe('category-to-color mapping', () => {
    it('should map "adoption" to primary colors', () => {
      const colors = getCategoryColor('adoption');
      expect(colors.bg).toBe('bg-primary/20');
      expect(colors.text).toBe('text-primary');
    });

    it('should map "feeding" to active colors', () => {
      const colors = getCategoryColor('feeding');
      expect(colors.bg).toBe('bg-active/20');
      expect(colors.text).toBe('text-active');
    });

    it('should map "tnr" to accent colors', () => {
      const colors = getCategoryColor('tnr');
      expect(colors.bg).toBe('bg-accent/20');
      expect(colors.text).toBe('text-accent');
    });

    it('should map "fundraiser" to secondary colors', () => {
      const colors = getCategoryColor('fundraiser');
      expect(colors.bg).toBe('bg-secondary/20');
      expect(colors.text).toBe('text-secondary');
    });

    it('should map "meetup" to primary colors', () => {
      const colors = getCategoryColor('meetup');
      expect(colors.bg).toBe('bg-primary/20');
      expect(colors.text).toBe('text-primary');
    });

    it('should map "volunteer" to active colors', () => {
      const colors = getCategoryColor('volunteer');
      expect(colors.bg).toBe('bg-active/20');
      expect(colors.text).toBe('text-active');
    });

    it('should map unknown categories to disabled/text colors', () => {
      const colors = getCategoryColor('unknown');
      expect(colors.bg).toBe('bg-disabled/20');
      expect(colors.text).toBe('text-text');
    });

    it('should map empty string to default colors', () => {
      const colors = getCategoryColor('');
      expect(colors.bg).toBe('bg-disabled/20');
      expect(colors.text).toBe('text-text');
    });
  });

  describe('deterministic mapping', () => {
    it('should return the same color for the same category on repeated calls', () => {
      const first = getCategoryColor('tnr');
      const second = getCategoryColor('tnr');
      expect(first).toEqual(second);
    });

    it('should return distinct colors for distinct categories (tnr vs fundraiser)', () => {
      const tnr = getCategoryColor('tnr');
      const fundraiser = getCategoryColor('fundraiser');
      expect(tnr.bg).not.toBe(fundraiser.bg);
      expect(tnr.text).not.toBe(fundraiser.text);
    });
  });
});
