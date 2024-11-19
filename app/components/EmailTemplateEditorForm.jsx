import { useState } from 'react';

export const getAbandonedCartDetails = async (customerId) => {

  try {
    const customerWithCarts = await prisma.customer.findUnique({
      where: {id: customerId},
      include: {
        abandonedCarts:{
          include:{
            shop: true,
          },
        },
      },
    });

    return customerWithCarts
  } catch (error) {
    console.error('error fetching the abandoned carts:', error);
    throw new Error('Failed to retrieve data')
  }
};


export const prepareEmailTemplate = (customer) => {
  // Map over abandoned carts and format each one
  const abandonedCartItems = customer.abandonedCarts
    .map((cart) => {
      // Parse cart items stored as a serialized JSON string
      const items = JSON.parse(cart.items);

      // Format cart items into an HTML list
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

  // Combine everything into the final email template
  return `
    <div>
      <h2>Dear ${customer.firstName} ${customer.lastName},</h2>
      <p>It seems you left some items in your cart. Don't miss out on these amazing products:</p>
      ${abandonedCartItems}
      <p>Complete your purchase today!</p>
    </div>
  `;
};


export const EmailTemplateEditorForm = ({ template, onTemplateChange }) => {
  // Add a default value check
  const currentTemplate = template || {
    subject: '',
    content: '',
    logo: '',
    image: ''
  };

  const handleInputChange = (key, value) => {
    onTemplateChange({ ...currentTemplate, [key]: value });
  };

  const { customer } = currentTemplate;
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Edit Email Template</h1>
      <div style={{ display: 'flex' }}>
        <div style={{ marginRight: '20px', width: '60%' }}>
          <input
            type="text"
            placeholder="Subject Line"
            value={currentTemplate.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '15px',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
          />
          <textarea
            placeholder="Email Content"
            value={currentTemplate.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              height: '200px',
              marginBottom: '15px',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
          />
        </div>
        <div>
          <button
            onClick={() => handleInputChange('logo', '/new-logo.png')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007BFF',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              marginBottom: '10px',
              cursor: 'pointer',
            }}
          >
            Upload Logo
          </button>
          <br />
          <button
            onClick={() => handleInputChange('image', '/new-image.jpg')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007BFF',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Upload Image
          </button>
        </div>

        {/* Preview the prepared email template */}
        {customer && (
          <div style={{ border: '1px solid #ccc', padding: '10px', marginTop: '20px' }}>
            <h3>Email Preview</h3>
            <div
              dangerouslySetInnerHTML={{ __html: prepareEmailTemplate(customer) }}
            ></div>
          </div>
         )}
      </div>
    </div>
  );
};
