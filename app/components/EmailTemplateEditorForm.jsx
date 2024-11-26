import { useState } from 'react';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getAbandonedCartDetails = async (customerId) => {
  try {
    const customerWithCarts = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        abandonedCarts: {
          include: {
            shop: true,
          },
        },
      },
    });

    return customerWithCarts;
  } catch (error) {
    console.error('Error fetching the abandoned carts:', error);
    throw new Error('Failed to retrieve data');
  }
};

export const fetchEmailTemplate = async (shopId) => {
  try {
    const template = await prisma.emailTemplate.findFirst({
      where: { shopId },
    });

    if (!template) {
      throw new Error('No email template found for this shop.');
    }

    return template;
  } catch (error) {
    console.error('Error fetching email template:', error);
    throw new Error('Failed to retrieve email template');
  }
};

export const prepareEmailTemplate = (customer, template) => {
  const abandonedCartItems = customer.abandonedCarts
    .map((cart) => {
      let items = cart.items;

      // Check if the items are a string and need to be parsed
      if (typeof items === 'string') {
        try {
          items = JSON.parse(items); // Parse if it's a string
        } catch (error) {
          console.error('Error parsing items:', error);
          items = []; // Fallback to an empty array if parsing fails
        }
      }

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

  const content = template.content
    .replace('{{customerFirstName}}', customer.firstName)
    .replace('{{customerLastName}}', customer.lastName)
    .replace('{{cartDetails}}', abandonedCartItems);

  return `
    <div>
      <h2>${template.subject}</h2>
      ${content}
      <p>Complete your purchase today!</p>
    </div>
  `;
};


export const EmailTemplateEditorForm = ({ template, onTemplateChange }) => {
  const currentTemplate = template || {
    subject: '',
    content: '',
    logo: '',
    image: '',
    customer: null, // Ensure there's a fallback for customer
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
          <div
            style={{
              border: '1px solid #ccc',
              padding: '10px',
              marginTop: '20px',
            }}
          >
            <h3>Email Preview</h3>
            <div
              dangerouslySetInnerHTML={{
                __html: prepareEmailTemplate(customer, currentTemplate),
              }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};
