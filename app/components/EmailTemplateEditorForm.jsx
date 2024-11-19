import { useState } from 'react';

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
      </div>
    </div>
  );
};
