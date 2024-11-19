import { prismaMock } from '../../test/singleton';
import { processAutomaticReminders } from '../reminderService.server';
import { sendAbandonedCartReminder } from '../emailService.server';
import * as abandonedCartModel from '../../models/abandonedCart.server';

jest.mock('../emailService.server');

describe('Reminder Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process reminders for eligible carts', async () => {
    const mockCarts = [
      {
        id: 'cart1',
        email: 'test@example.com',
        items: JSON.stringify([{ name: 'Product 1', price: 10 }])
      }
    ];

    jest.spyOn(abandonedCartModel, 'getCartsNeedingReminders').mockResolvedValue(mockCarts);
    jest.spyOn(abandonedCartModel, 'updateAbandonedCartReminder').mockResolvedValue({ id: 'cart1', reminderSent: true });
    sendAbandonedCartReminder.mockResolvedValue({ success: true });

    const results = await processAutomaticReminders('shop1');

    expect(abandonedCartModel.getCartsNeedingReminders).toHaveBeenCalledWith('shop1');
    expect(sendAbandonedCartReminder).toHaveBeenCalledTimes(1);
    expect(abandonedCartModel.updateAbandonedCartReminder).toHaveBeenCalledWith('cart1', true);
    expect(results).toHaveLength(1);
    expect(results[0].status).toBe('fulfilled');
  });

  it('should handle errors during reminder processing', async () => {
    const mockCarts = [{ id: 'cart1', email: 'test@example.com' }];
    const error = new Error('Email sending failed');

    jest.spyOn(abandonedCartModel, 'getCartsNeedingReminders').mockResolvedValue(mockCarts);
    sendAbandonedCartReminder.mockRejectedValue(error);

    const results = await processAutomaticReminders('shop1');

    expect(results[0].status).toBe('rejected');
    expect(results[0].reason).toBe(error);
  });
});