import { prismaMock } from '../../test/singleton';
import {
  getAbandonedCarts,
  getCartsNeedingReminders,
  createAbandonedCart,
  updateAbandonedCartReminder,
  getAbandonedCart
} from '../abandonedCart.server';

// Mock data
const mockCustomer = {
  id: 'cust1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com'
};

const mockCartData = {
  id: 'cart1',
  shopId: 'shop1',
  customerId: 'cust1',
  email: 'john@example.com',
  items: JSON.stringify([{ id: 1, name: 'Test Product', price: 10 }]),
  createdAt: new Date('2024-01-01'),
  reminderSent: false,
  reminderSentAt: null,
  customer: mockCustomer
};

describe('Abandoned Cart Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAbandonedCarts', () => {
    it('should return all abandoned carts for a shop', async () => {
      prismaMock.abandonedCart.findMany.mockResolvedValue([mockCartData]);

      const result = await getAbandonedCarts('shop1');
      
      expect(prismaMock.abandonedCart.findMany).toHaveBeenCalledWith({
        where: { shopId: 'shop1' },
        include: { customer: true }
      });
      expect(result).toHaveLength(1);
      expect(result[0].items).toEqual([{ id: 1, name: 'Test Product', price: 10 }]);
    });

    it('should handle errors properly', async () => {
      prismaMock.abandonedCart.findMany.mockRejectedValue(new Error('Database error'));

      await expect(getAbandonedCarts('shop1')).rejects.toThrow('Database error');
    });
  });

  describe('getCartsNeedingReminders', () => {
    it('should return carts that need reminders', async () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const mockOldCart = { ...mockCartData, createdAt: threeDaysAgo };
      prismaMock.abandonedCart.findMany.mockResolvedValue([mockOldCart]);

      const result = await getCartsNeedingReminders('shop1');
      
      expect(prismaMock.abandonedCart.findMany).toHaveBeenCalledWith({
        where: {
          shopId: 'shop1',
          reminderSent: false,
          createdAt: { lt: expect.any(Date) }
        },
        include: { customer: true }
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('createAbandonedCart', () => {
    it('should create a new abandoned cart', async () => {
      const cartData = {
        customerId: 'cust1',
        email: 'john@example.com',
        items: [{ id: 1, name: 'Test Product', price: 10 }]
      };

      prismaMock.abandonedCart.create.mockResolvedValue(mockCartData);

      const result = await createAbandonedCart('shop1', cartData);
      
      expect(prismaMock.abandonedCart.create).toHaveBeenCalledWith({
        data: {
          shopId: 'shop1',
          customerId: 'cust1',
          email: 'john@example.com',
          items: JSON.stringify(cartData.items),
          createdAt: expect.any(Date),
          reminderSent: false,
          reminderSentAt: null
        }
      });
      expect(result).toEqual(mockCartData);
    });
  });

  describe('updateAbandonedCartReminder', () => {
    it('should update reminder status and timestamp', async () => {
      const updatedCart = { ...mockCartData, reminderSent: true, reminderSentAt: new Date() };
      prismaMock.abandonedCart.update.mockResolvedValue(updatedCart);

      const result = await updateAbandonedCartReminder('cart1', true);
      
      expect(prismaMock.abandonedCart.update).toHaveBeenCalledWith({
        where: { id: 'cart1' },
        data: { 
          reminderSent: true,
          reminderSentAt: expect.any(Date)
        }
      });
      expect(result.reminderSent).toBe(true);
      expect(result.reminderSentAt).toBeTruthy();
    });
  });

  describe('getAbandonedCart', () => {
    it('should return a specific cart', async () => {
      prismaMock.abandonedCart.findFirst.mockResolvedValue(mockCartData);

      const result = await getAbandonedCart('shop1', 'cart1');
      
      expect(prismaMock.abandonedCart.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'cart1',
          shopId: 'shop1'
        },
        include: { customer: true }
      });
      expect(result.items).toEqual([{ id: 1, name: 'Test Product', price: 10 }]);
    });

    it('should throw error when cart not found', async () => {
      prismaMock.abandonedCart.findFirst.mockResolvedValue(null);

      await expect(getAbandonedCart('shop1', 'cart1')).rejects.toThrow('Cart not found');
    });
  });
});