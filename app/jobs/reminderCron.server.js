import cron from 'node-cron';
import { prisma } from "../db.server";
import { processAutomaticReminders } from "../services/reminderService.server";

export function startReminderCron() {
  // Run once per day at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      // Get all shops
      const shops = await prisma.shop.findMany({
        where: { isActive: true } // Only get active shops
      });
      
      console.log('Starting daily reminder check...');
      
      // Process reminders for each shop
      for (const shop of shops) {
        await processAutomaticReminders(shop.id);
      }
      
      console.log('Daily reminder check completed successfully');
    } catch (error) {
      console.error('Daily reminder check failed:', error);
    }
  });
}