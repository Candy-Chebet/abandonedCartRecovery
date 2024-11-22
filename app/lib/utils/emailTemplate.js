export function prepareEmailTemplate(customer, template) {
    const abandonedCartItems = customer.abandonedCarts
      .map((cart) => {
        const items = cart.items; // Assuming items are already parsed
        return `
          <h4>Cart from Shop: ${cart.shop.name}</h4>
          <ul>
            ${items
              .map(
                (item) =>
                  `<li>${item.name} - Quantity: ${item.quantity} - Price: $${item.price}</li>`
              )
              .join('')}
          </ul>
          <p>Created At: ${new Date(cart.createdAt).toLocaleString()}</p>
        `;
      })
      .join('<hr>');
  
    return `
      <div>
        <h2>${template.subject}</h2>
        ${template.content
          .replace('{{customerFirstName}}', customer.firstName)
          .replace('{{customerLastName}}', customer.lastName)
          .replace('{{cartDetails}}', abandonedCartItems)}
        <p>Complete your purchase today!</p>
      </div>
    `;
  }
  
  export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }