import { useRef, useState } from 'react';
import { EmailEditor } from 'react-email-editor';

import { json } from '@remix-run/node';
import { useLoaderData, useSubmit } from '@remix-run/react';
import { authenticate } from '../shopify.server';
import { getEmailTemplates, createEmailTemplate } from '../lib/database/emailTemplate.server';
//import defaultTemplate from '../data/defaultTemplate';
import { getShopAbandonedCarts } from '../lib/database/abandonedCart.server';

// Loader function remains the same
export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  const shopId = session.shop;

  // Abandoned carts and templates logic
  let abandonedCarts = [];
  try {
    abandonedCarts = await getShopAbandonedCarts(shopId);
  } catch (error) {
    console.log('No abandoned carts found, using default template');
    abandonedCarts = [];
  }

  if (!Array.isArray(abandonedCarts)) {
    abandonedCarts = [];
  }

  if (abandonedCarts.length === 0) {
    abandonedCarts = [
      {
        timeFrame: 'Default',
        carts: [
          {
            id: 'default',
            customer: { firstName: 'John', lastName: 'Doe' },
            lastUpdated: new Date(),
            recoveryUrl: 'https://default-url.com',
            items: [{ name: 'item1', quantity: 1 }, { name: 'item2', quantity: 2 }, { name: 'item3', quantity: 1 }], // JSON string for items
          },
        ],
      },
    ];
  }

  const defaultTemplate = {
    subject: 'Your Cart is waiting for you!',
    logo: '/logo.png',
    content: (
        <div>
            <h1>Hey there!</h1>
            <p>Looks like you left some items in your cart. Don't worry, we've saved them for you.</p>
            <a href="/cart">Go to cart</a>
            <img src="/cart.png" alt="Cart items" />
        </div>
    )
}


  let templates = [];
  try {
    templates = await getEmailTemplates(shopId);
  } catch (error) {
    console.log('No email templates found, using default template');
    templates = [
      {
        id: 'default',
        name: 'Default Template',
        subject: defaultTemplate.subject,
        body: defaultTemplate.content,
        logo: defaultTemplate.logo,      // Optionally use logo if needed
        image: '/cart.png',  
      },
    ];
  }

  if (!Array.isArray(templates)) {
    templates = [];
  }

  return json({
    templates,
    abandonedCarts,
  });
}



// Styles
const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  editorContainer: {
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  button: {
    backgroundColor: '#008060',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px',
  },
  templateList: {
    marginTop: '30px',
  },
  templateItem: {
    border: '1px solid #e5e5e5',
    padding: '15px',
    marginBottom: '15px',
    borderRadius: '4px',
  },
};

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const shopId = session.shop;

  const formData = await request.formData();
  const templateData = {
    shopId: formData.get('shopId'),
    subject: formData.get('subject'),
    content: formData.get('content'),
    logo: formData.get('logo'),
    image: formData.get('image'),
    shopId,
  };

  try {
    await createEmailTemplate(templateData); // Create the template in the database
    return json({ templateData });
  } catch (err) {
    console.error('Error saving template:', err);
    return json({ error: 'Failed to save email template' }, { status: 500 });
  }
}

export default function Templates() {
  const loaderData = useLoaderData() || {};
  const { templates = [], abandonedCarts = [] } = loaderData;
  const emailEditorRef = useRef(null);
  const submit = useSubmit();

  const onReady = () => {
    if (emailEditorRef.current) {const htmlContent = ReactDOMServer.renderToStaticMarkup(defaultTemplate.content);
      emailEditorRef.current.editor.loadDesign(htmlContent); // Load HTML content// Load default template
    }
  };

  const saveTemplate = () => {
    if (emailEditorRef.current) {
      emailEditorRef.current.editor.exportHtml(() => {
        const formData = new FormData();
        formData.append('subject', 'Abandoned Cart Recovery');
        formData.append('logo', '{{{emailTemplate.logo}}}');
        submit(formData, { method: 'post' });
      });
    }
  };

  const loadTemplate = (template) => {
    if (emailEditorRef.current) {
      emailEditorRef.current.editor.loadDesign(template.content); // Load saved template
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Email Templates</h1>
      <div style={styles.editorContainer}>
        <EmailEditor
          ref={emailEditorRef}
          onReady={onReady}
          minHeight="700px"
          options={{
            customCSS: ['https://fonts.googleapis.com/css?family=Open+Sans'],
            features: {
              textEditor: {
                tables: true,
                cleanPaste: true,
              },
            },
            mergeTags: [
              {
                name: 'Shop',
                tags: [
                  { name: 'Logo', value: '{{{shop.logo}}}' },
                  { name: 'Name', value: '{{{shop.name}}}' },
                ],
              },
              {
                name: 'Customer',
                tags: [
                  { name: 'First Name', value: '{{{customer.firstName}}}' },
                  { name: 'Last Name', value: '{{{customer.lastName}}}' },
                  { name: 'Email', value: '{{{customer.email}}}' },
                ],
              },
              {
                name: 'Cart',
                tags: [
                  { name: 'Recovery URL', value: '{{{cart.recoveryUrl}}}' },
                  { name: 'Total', value: '{{{cart.total}}}' },
                ],
              },
            ],
          }}
        />
      </div>

      <button style={styles.button} onClick={saveTemplate}>
        Save Template
      </button>

      <div style={styles.templateList}>
        <h2 style={styles.header}>Existing Templates</h2>
        {templates && templates.length === 0 ? (
          <p>No templates found</p>
        ) : (
          templates.map((template) => (
            <div key={template.id} style={styles.templateItem}>
              <h3>{template.subject}</h3>
              <button
                style={styles.button}
                onClick={() => loadTemplate(template)}
              >
                Load Template
              </button>
            </div>
          ))
        )}
      </div>

      <div style={styles.templateList}>
        <h2 style={styles.header}>Abandoned Carts</h2>
        {abandonedCarts.length === 0 ? (
          <p>No abandoned carts found</p>
        ) : (
          abandonedCarts.map((cart) => {
            const itemCount = cart.carts ? cart.carts.length : 0;
            return (
              <div key={cart.timeFrame} style={styles.templateItem}>
                <h3>{cart.timeFrame} Abandoned Carts: {itemCount}</h3>
                {cart.carts &&
                  cart.carts.map((cartItem, index) => (
                    <div key={index}>
                      Customer: {cartItem.customer.firstName}{' '}
                      {cartItem.customer.lastName}
                      <ul>
                        {cartItem.items.map((item, idx) => (
                          <li key={idx}>
                            {item.name} (x{item.quantity})
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
