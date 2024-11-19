import { useState } from 'react';
// import { useMutation } from '@tanstack/react-query';
import { useNavigation, json } from '@remix-run/react';
import { EmailTemplatePreview } from '../components/EmailTemplatePreview';
import { EmailTemplateEditorForm } from '../components/EmailTemplateEditorForm';
import defaultTemplate from '../data/defaultTemplate'



export async function loader() {
  return json({
    defaultTemplate: defaultTemplate,
  });

}

export async function action({}) {
  const formData = await request.formData();
  const template = JSON.parse(formData.get('template'))

    // Here you would typically save the template to your database
  // For now, we'll just return the template

  return json({ template });
};


export default function Templates() {

  const [template, setTemplate] = useState(defaultTemplate);
  const navigation = useNavigation();


  const handleSave = async () => {
    const formData = new FormData();
    formData.append('template', JSON.stringify(template));

    await fetch('/samples', {
      method: 'POST',
      body: formData,
    });
  };

  return (
    <div>
      <EmailTemplateEditorForm template={template} onTemplateChange={setTemplate} />
      <EmailTemplatePreview template={template} />
      <button
        onClick={handleSave}
        disabled = {navigation.state === "submitting"}
      >
        {navigation.state === "submitting" ? "Saving..." : "Save Template"}
      </button>
    </div>
  );
};