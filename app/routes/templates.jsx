import { useRef, useState } from "react";
import { EmailEditor } from "react-email-editor";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { getEmailTemplates, createEmailTemplate } from "../lib/database/emailTemplate.server";
import defaultTemplate from "../data/defaultTemplate";
import { getShopAbandonedCarts } from "../lib/database/abandonedCart.server";
import { renderToString } from "react-dom/server";

// Loader function remains the same
export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  const shopDomain = session.shop;

  const shop = await prisma.shop.upsert({
    where: { domain: 'candystoredev.myshopify.com' },
    update: { accessToken: 'token...' },
    create: {
      id: 'generated_cuid',
      name: 'Candy Store Dev',
      domain: 'candystoredev.myshopify.com',
      accessToken: 'token...',
      isActive: true,
    },
  });

  let abandonedCarts = [];
  try {
    abandonedCarts = await getShopAbandonedCarts(shop.id);
  } catch (error) {
    console.error("Error fetching abandoned carts:", error);
  }

  let templates = [];
  try {
    templates = await getEmailTemplates(shop.id);

    // console.log("here is the template", templates);
  } catch (error) {
    console.error("Error fetching email templates:", error);
  }

  return json({ templates, abandonedCarts, shop });
}

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const shopDomain = session.shop;

  const shop = await prisma.shop.upsert({
    where: { domain: 'candystoredev.myshopify.com' },
    update: { accessToken: 'token...' },
    create: {
      id: 'generated_cuid',
      name: 'Candy Store Dev',
      domain: 'candystoredev.myshopify.com',
      accessToken: 'token...',
      isActive: true
    },
  });

  const formData = await request.formData();
  const templateData = {
    shopId: shop.id,
    name: formData.get("name"),
    subject: formData.get("subject"),
    content: formData.get("content"),
    design: formData.get("design"),
    logo: formData.get("logo"),
  };

  try {
    const result = await createEmailTemplate(templateData);
    return json({ success: true, template: result });
  } catch (err) {
    console.error("Error saving template:", err);
    return json({ error: "Failed to save email template" }, { status: 500 });
  }
}

export default function Templates() {
  const { templates = [], abandonedCarts = [] } = useLoaderData() || {};
  const emailEditorRef = useRef("");
  const submit = useSubmit();
  const [templateName, setTemplateName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const styles = {
    container: {
      padding: "20px",
      maxWidth: "1200px",
      margin: "0 auto",
    },
    header: {
      fontSize: "24px",
      fontWeight: "bold",
      marginBottom: "20px",
    },
    editorContainer: {
      border: "1px solid #ccc",
      borderRadius: "4px",
      marginBottom: "20px",
      minHeight: "700px",
    },
    button: {
      backgroundColor: "#008060",
      color: "white",
      padding: "10px 20px",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      marginRight: "10px",
    },
    input: {
      padding: "8px 12px",
      borderRadius: "4px",
      border: "1px solid #ccc",
      fontSize: "14px",
      marginRight: "10px",
      width: "300px",
    },
    error: {
      color: "red",
      marginTop: "10px",
    },
    templateList: {
      marginTop: "30px",
    },
    templateItem: {
      border: "1px solid #e5e5e5",
      padding: "15px",
      marginBottom: "15px",
      borderRadius: "4px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
  };

  const onReady = () => {
    if (emailEditorRef.current && defaultTemplate?.content) {
      try {
        const htmlContent = renderToString(defaultTemplate.content);
        emailEditorRef.current.editor.loadDesign({
          html: htmlContent,
        });
      } catch (error) {
        console.error("Error loading default template:", error);
        setError("Failed to load default template");
      }
    }
  };

  const saveTemplate = () => {
    if (!emailEditorRef.current || isSaving) return;
    if (!templateName.trim()) {
      setError("Please enter a template name");
      return;
    }

    setIsSaving(true);
    setError("");

    emailEditorRef.current.editor.exportHtml((data) => {
      try {
        const { html, design } = data;
        const formData = new FormData();
        formData.append("name", templateName.trim());
        formData.append("subject", "Abandoned Cart Recovery");
        formData.append("content", html);
        formData.append("design", JSON.stringify(design));
        formData.append("logo", "{{{emailTemplate.logo}}}");

        submit(formData, {
          method: "post",
          onFinish: () => {
            setIsSaving(false);
            setTemplateName("");
            setError("");
          },
        });
      } catch (error) {
        console.error("Error saving template:", error);
        setError("Failed to save template");
        setIsSaving(false);
      }
    });
  };

  const loadTemplate = (template) => {
    if (!emailEditorRef.current || !template) {
      setError("Cannot load template: Editor not ready or template is invalid");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const defaultDesign = {
        body: {
          rows: [],
          values: {
            backgroundColor: "#ffffff",
            width: "600px",
            padding: "0px",
          },
        },
      };

      let designData;
      try {
        designData = template.design ? JSON.parse(template.design) : defaultDesign;
      } catch (e) {
        console.warn("Could not parse template design, using default:", e);
        designData = defaultDesign;
      }

      const htmlContent = template.content || '<div></div>';

      emailEditorRef.current.editor.loadDesign({
        html: htmlContent,
        design: designData,
      });

      setTemplateName(template.name || "");
      setError("");
    } catch (error) {
      console.error("Error loading template:", error);
      setError(`Failed to load template: ${template.name}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Email Templates</h1>
      <div>
        <input
          type="text"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder="Template Name"
          style={styles.input}
        />
        <button
          style={{
            ...styles.button,
            opacity: isSaving || isLoading ? 0.7 : 1,
            cursor: isSaving || isLoading ? "not-allowed" : "pointer",
          }}
          onClick={saveTemplate}
          disabled={isSaving || isLoading}
        >
          {isSaving ? "Saving..." : "Save Template"}
        </button>
        {error && <div style={styles.error}>{error}</div>}
      </div>

      <div style={styles.editorContainer}>
        <EmailEditor
          ref={emailEditorRef}
          onReady={onReady}
          options={{
            features: {
              textEditor: {
                color: true,
                fontFamily: true,
                fontSize: true,
              },
            },
            appearance: {
              theme: "light",
            },
          }}
        />
      </div>

      <div style={styles.templateList}>
        <h2 style={styles.header}>Existing Templates</h2>
        {templates.length === 0 ? (
          <p>No templates found</p>
        ) : (
          templates.map((template) => (
            <div key={template.id} style={styles.templateItem}>
              <div>
                <h3>{template.name || "Untitled Template"}</h3>
                <p>{template.subject}</p>
              </div>
              <button
                style={{
                  ...styles.button,
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? "not-allowed" : "pointer",
                }}
                onClick={() => loadTemplate(template)}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Load"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
