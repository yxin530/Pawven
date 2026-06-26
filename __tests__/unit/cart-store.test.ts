import { useCartStore } from '@/store/cart-store';

describe('cart-store', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], total: 0 });
  });

  describe('initial state', () => {
    it('should have empty items and total 0', () => {
      const state = useCartStore.getState();
      expect(state.items).toEqual([]);
      expect(state.total).toBe(0);
    });
  });

  describe('addItem', () => {
    it('should add a new item with quantity 1', () => {
      useCartStore.getState().addItem({
        feederId: 'feeder-1',
        feederName: 'Park Feeder',
        grams: 50,
        pricePerUnit: 5,
      });

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].feederId).toBe('feeder-1');
      expect(state.items[0].quantity).toBe(1);
      expect(state.total).toBe(5);
    });

    it('should increment quantity when adding existing item (same feederId + grams)', () => {
      const item = {
        feederId: 'feeder-1',
        feederName: 'Park Feeder',
        grams: 50 as const,
        pricePerUnit: 5,
      };

      useCartStore.getState().addItem(item);
      useCartStore.getState().addItem(item);

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(2);
      expect(state.total).toBe(10);
    });

    it('should add separate items for same feeder but different grams', () => {
      useCartStore.getState().addItem({
        feederId: 'feeder-1',
        feederName: 'Park Feeder',
        grams: 50,
        pricePerUnit: 5,
      });
      useCartStore.getState().addItem({
        feederId: 'feeder-1',
        feederName: 'Park Feeder',
        grams: 100,
        pricePerUnit: 9,
      });

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(2);
      expect(state.total).toBe(14);
    });
  });

  describe('removeItem', () => {
    it('should remove an item by feederId and grams', () => {
      useCartStore.getState().addItem({
        feederId: 'feeder-1',
        feederName: 'Park Feeder',
        grams: 50,
        pricePerUnit: 5,
      });
      useCartStore.getState().addItem({
        feederId: 'feeder-2',
        feederName: 'Garden Feeder',
        grams: 20,
        pricePerUnit: 3,
      });

      useCartStore.getState().removeItem('feeder-1', 50);

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].feederId).toBe('feeder-2');
      expect(state.total).toBe(3);
    });

    it('should do nothing if item does not exist', () => {
      useCartStore.getState().addItem({
        feederId: 'feeder-1',
        feederName: 'Park Feeder',
        grams: 50,
        pricePerUnit: 5,
      });

      useCartStore.getState().removeItem('feeder-999', 50);

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.total).toBe(5);
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      useCartStore.getState().addItem({
        feederId: 'feeder-1',
        feederName: 'Park Feeder',
        grams: 50,
        pricePerUnit: 5,
      });

      useCartStore.getState().updateQuantity('feeder-1', 50, 3);

      const state = useCartStore.getState();
      expect(state.items[0].quantity).toBe(3);
      expect(state.total).toBe(15);
    });

    it('should enforce minimum quantity of 1', () => {
      useCartStore.getState().addItem({
        feederId: 'feeder-1',
        feederName: 'Park Feeder',
        grams: 50,
        pricePerUnit: 5,
      });

      useCartStore.getState().updateQuantity('feeder-1', 50, 0);

      const state = useCartStore.getState();
      expect(state.items[0].quantity).toBe(1);
      expect(state.total).toBe(5);
    });

    it('should enforce minimum quantity of 1 for negative values', () => {
      useCartStore.getState().addItem({
        feederId: 'feeder-1',
        feederName: 'Park Feeder',
        grams: 50,
        pricePerUnit: 5,
      });

      useCartStore.getState().updateQuantity('feeder-1', 50, -5);

      const state = useCartStore.getState();
      expect(state.items[0].quantity).toBe(1);
    });
  });

  describe('clearCart', () => {
    it('should empty all items and set total to 0', () => {
      useCartStore.getState().addItem({
        feederId: 'feeder-1',
        feederName: 'Park Feeder',
        grams: 50,
        pricePerUnit: 5,
      });
      useCartStore.getState().addItem({
        feederId: 'feeder-2',
        feederName: 'Garden Feeder',
        grams: 20,
        pricePerUnit: 3,
      });

      useCartStore.getState().clearCart();

      const state = useCartStore.getState();
      expect(state.items).toEqual([]);
      expect(state.total).toBe(0);
    });
  });
});
