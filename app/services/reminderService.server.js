import { getCartsNeedingReminders, updateAbandonedCartReminder } from "../models/abandonedCart.server";
import { sendAbandonedCartReminder } from "./emailService.server";

export async function processAutomaticReminders(shopId) {
  try {
    // Get all carts needing reminders (abandoned for 3+ days)
    const cartsToRemind = await getCartsNeedingReminders(shopId);
    
    // Process each cart
    const results = await Promise.allSettled(
      cartsToRemind.map(async (cart) => {
        try {
          // Send the reminder email
          await sendAbandonedCartReminder(cart);
          // Update the cart to mark reminder as sent
          await updateAbandonedCartReminder(cart.id, true);
          
          console.log(`Successfully sent reminder for cart ${cart.id}`);
          return { success: true, cartId: cart.id };
        } catch (error) {
          console.error(`Failed to process cart ${cart.id}:`, error);
          return { success: false, cartId: cart.id, error: error.message };
        }
      })
    );
    
    return results;
  } catch (error) {
    console.error("Failed to process automatic reminders:", error);
    throw error;
  }
}
