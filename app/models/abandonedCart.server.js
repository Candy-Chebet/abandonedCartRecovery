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

export async function createAbandonedCart(shopId, cartData) {
  try {
    return await prisma.abandonedCart.create({
      data: {
        shopId,
        customerId: cartData.customerId,
        email: cartData.email,
        items: JSON.stringify(cartData.items),
        createdAt: new Date()
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
      data: { reminderSent }
    });
  } catch (error) {
    console.error('Error in updateAbandonedCartReminder:', error);
    throw error;
  }
}