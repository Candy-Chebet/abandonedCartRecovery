import { prisma } from "../db.server";

export async function getAbandonedCarts(shopId) {
  try {
    const carts = await prisma.abandonedCart.findMany({
      where: { shopId },
      include: { customer: true }
    });

    return carts.map(cart => ({
      ...cart,
      items: JSON.parse(cart.items)
    }));
  } catch (error) {
    console.error('Error in getAbandonedCarts:', error);
    throw error;
  }
}

export async function getCartsNeedingReminders(shopId) {
  try {
    const daysUntilReminder = 3;
    const millisecondsInDay = 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(Date.now() - daysUntilReminder * millisecondsInDay);
    
    const carts = await prisma.abandonedCart.findMany({
      where: {
        shopId,
        reminderSent: false,
        createdAt: {
          lt: cutoffDate // Get carts older than 3 days
        }
      },
      include: { customer: true }
    });

    return carts.map(cart => ({
      ...cart,
      items: JSON.parse(cart.items)
    }));
  } catch (error) {
    console.error('Error in getCartsNeedingReminders:', error);
    throw error;
  }
}

export async function createAbandonedCart(shopId, cartData) {
  try {
    return await prisma.abandonedCart.create({
      data: {
        shopId,
        customerId: cartData.customerId,
        email: cartData.email,
        items: JSON.stringify(cartData.items),
        createdAt: new Date(),
        reminderSent: false,
        reminderSentAt: null
      }
    });
  } catch (error) {
    console.error('Error in createAbandonedCart:', error);
    throw error;
  }
}

export async function updateAbandonedCartReminder(id, reminderSent) {
  try {
    return await prisma.abandonedCart.update({
      where: { id },
      data: { 
        reminderSent,
        reminderSentAt: reminderSent ? new Date() : null 
      }
    });
  } catch (error) {
    console.error('Error in updateAbandonedCartReminder:', error);
    throw error;
  }
}

export async function getAbandonedCart(shopId, cartId) {
  try {
    const cart = await prisma.abandonedCart.findFirst({
      where: {
        id: cartId,
        shopId
      },
      include: { customer: true }
    });

    if (!cart) {
      throw new Error('Cart not found');
    }

    return {
      ...cart,
      items: JSON.parse(cart.items)
    };
  } catch (error) {
    console.error('Error in getAbandonedCart:', error);
    throw error;
  }
}