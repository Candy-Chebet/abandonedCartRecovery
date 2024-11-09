import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAbandonedCartReminder(cart) {
  return resend.emails.send({
    from: 'noreply@yourdomain.com',
    to: cart.email,
    subject: 'Don\'t forget your cart!',
    html: `
      <h2>Hey there!</h2>
      <p>We noticed you left some items in your cart. Here's a reminder to come back and complete your purchase.</p>
      <p>Your cart contents:</p>
      <ul>
        ${cart.items.map(item => `<li>${item.title} - $${item.price}</li>`).join('')}
      </ul>
      <p>Click here to go back to your cart: <a href="${process.env.APP_URL}/cart/${cart.id}">Complete your order</a></p>
    `
  });
}
