import { useState } from 'react';
import { Form } from '@remix-run/react';
import './emailTemplateForm.css';



export const links = () => [{ rel: "stylesheet", href: styles }];

export function EmailTemplateForm({ 
  template, 
  onSubmit, 
  abandonedCarts 
}) {
  const [formData, setFormData] = useState({
    subject: template?.subject || 'Complete Your Purchase',
    content: template?.content || `
Hi {{customerFirstName}},

Looks like you left some items in your cart. Don't worry, we've saved them for you.

Here are the details:

{{cartDetails}}

Don't miss out!
    `.trim(),
    logo: template?.logo || '',
    image: template?.image || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="form-container">
      <Form onSubmit={handleSubmit}>
        <div>
          <label>Subject</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Email Subject"
          />
        </div>
        <div>
          <label>Content</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Email Content"
          />
        </div>
        <div>
          <label>Logo URL</label>
          <input
            type="text"
            name="logo"
            value={formData.logo}
            onChange={handleChange}
            placeholder="Logo URL"
          />
        </div>
        <div>
          <label>Image URL</label>
          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="Image URL"
          />
        </div>
        <button type="submit">Save Template</button>
      </Form>

      {abandonedCarts && (
        <div className="abandoned-cart-preview">
          <h3>Preview Abandoned Carts</h3>
          {abandonedCarts.map(cart => (
            <div key={cart.id} className="cart-item">
              <p>Customer: {cart.customer.firstName} {cart.customer.lastName}</p>
              <p>Shop: {cart.shop.name}</p>
              <ul>
                {cart.items.map(item => (
                  <li key={item.id}>
                    {item.name} - Qty: {item.quantity} - ${item.price}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}