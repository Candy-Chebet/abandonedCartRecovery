import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { authenticate } from '../shopify.server';
import { 
  getEmailTemplates, 
  createEmailTemplate 
} from '../lib/database/emailTemplate.server';
import { getShopAbandonedCarts } from '../lib/database/abandonedCart.server';
import { EmailTemplateForm } from '../components/EmailTemplateForm';

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  const shopId = session.shop;
  
  const [templates, abandonedCarts] = await Promise.all([
    getEmailTemplates(shopId),
    getShopAbandonedCarts(shopId)
  ]);

  return json({ templates, abandonedCarts });
}

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const shopId = session.shop;
  
  const formData = await request.formData();
  const templateData = {
    subject: formData.get('subject'),
    content: formData.get('content'),
    logo: formData.get('logo'),
    image: formData.get('image'),
    shopId,
  };

  await createEmailTemplate(templateData);
  return redirect('/app/email-templates');
}

export default function EmailTemplatesPage() {
  const { templates, abandonedCarts } = useLoaderData();

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Email Templates</h1>
      
      <EmailTemplateForm 
        abandonedCarts={abandonedCarts}
        onSubmit={async (data) => {
          // Optional client-side logic
          console.log('Template data:', data);
        }} 
      />

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Existing Templates</h2>
        {templates.map(template => (
          <div 
            key={template.id} 
            className="border p-4 mb-4 rounded-lg shadow-sm"
          >
            <h3 className="font-medium text-lg">{template.subject}</h3>
            <p className="text-gray-600 mt-2 truncate">{template.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}