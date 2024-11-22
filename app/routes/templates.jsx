// import { useState } from 'react';
// // import { useMutation } from '@tanstack/react-query';
// import { useNavigation, json } from '@remix-run/react';
// import { EmailTemplatePreview } from '../components/EmailTemplatePreview';
// import { EmailTemplateEditorForm } from '../components/EmailTemplateEditorForm';
// import defaultTemplate from '../data/defaultTemplate'



// export async function loader() {
//   return json({
//     defaultTemplate: defaultTemplate,
//   });

// }

// export async function action({}) {
//   const formData = await request.formData();
//   const template = JSON.parse(formData.get('template'))

//     // Here you would typically save the template to your database
//   // For now, we'll just return the template

//   return json({ template });
// };


// export default function Templates() {

//   const [template, setTemplate] = useState(defaultTemplate);
//   const navigation = useNavigation();


//   const handleSave = async () => {
//     const formData = new FormData();
//     formData.append('template', JSON.stringify(template));

//     await fetch('/samples', {
//       method: 'POST',
//       body: formData,
//     });
//   };

//   return (
//     <div>
//       <EmailTemplateEditorForm template={template} onTemplateChange={setTemplate} />
//       <EmailTemplatePreview template={template} />
//       <button
//         onClick={handleSave}
//         disabled = {navigation.state === "submitting"}
//       >
//         {navigation.state === "submitting" ? "Saving..." : "Save Template"}
//       </button>
//     </div>
//   );
// };

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