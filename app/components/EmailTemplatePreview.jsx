// In EmailTemplatePreview.jsx
export const EmailTemplatePreview = ({ template }) => {
  if (!template) {
    return <div>No template available</div>;
  }

  return (
    <div>
      <h2>Subject: {template.subject}</h2>
      <p>{template.content}</p>
    </div>
  );
};
