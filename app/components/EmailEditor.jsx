import React, { useRef, useState } from "react";
import { useLoaderData, useFetcher } from "@remix-run/react";
import EmailEditor from "react-email-editor";
import { GalleryModal } from "../components/GalleryModal";
import { SendMailModal } from "../components/SendMailModal";
import { MDBBtn } from "mdb-react-ui-kit";

export const loader = async () => {
  // Replace with your Shopify API or backend call to fetch photo files
  const res = await fetch("https://your-shopify-endpoint.com/api/photos");
  const data = await res.json();
  return { photoFiles: data };
};

export const action = async ({ request }) => {
  const formData = await request.formData();
  const uploadType = formData.get("type");

  if (uploadType === "upload") {
    // Handle file upload
    const files = formData.getAll("mediaFile");
    const metadata = formData.getAll("metadata");
    // Add logic to store files and metadata in your database or Shopify storage
    return { success: true, uploadedFiles: files };
  }

//   if (uploadType === "sendNewsletter") {
//     const emailHtml = formData.get("html");
//     // Add logic to send the newsletter using Shopify/your email provider
//     return { success: true, message: "Newsletter sent!" };
//   }

  return { success: false, message: "Invalid action" };
};

export default function Index() {
  const { photoFiles } = useLoaderData();
  const fetcher = useFetcher();
  const emailEditorRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
//   const [isOpenMailModal, setIsOpenMailModal] = useState(false);
  const [rawFiles, setRawFiles] = useState([]);
//   const [mailContent, setMailContent] = useState("");

  const toggleModal = () => setIsOpen((prev) => !prev);
  const toggleMailModal = () => setIsOpenMailModal((prev) => !prev);

  const exportHtml = () => {
    emailEditorRef.current?.editor.exportHtml(({ html }) => {
      if (html) {
        setMailContent(html);
        toggleMailModal();
      }
    });
  };

  const handleFileInputChange = async (e) => {
    const files = Array.from(e.target.files);
    const results = await Promise.all(files.map(getImageDimensions)); // From your library
    setRawFiles(results);
  };

  const handleFileUpload = () => {
    const formData = new FormData();
    rawFiles.forEach((fileData, index) => {
      formData.append("mediaFile", fileData.file);
      formData.append("metadata", JSON.stringify({ width: fileData.width, height: fileData.height }));
    });
    formData.append("type", "upload");
    fetcher.submit(formData, { method: "post" });
  };

  return (
    <div>
      {/* <div className="export_button">
        <MDBBtn onClick={exportHtml}>Send Newsletter</MDBBtn>
      </div> */}

      <EmailEditor
        editorId="editor_container"
        ref={emailEditorRef}
        onLoad={() => {}}
        onReady={() => {}}
      />

      <GalleryModal
        isOpen={isOpen}
        photoFiles={photoFiles}
        toggleModal={toggleModal}
        handleFileInputChange={handleFileInputChange}
        handleFileUpload={handleFileUpload}
        rawFiles={rawFiles}
        loading={fetcher.state === "submitting"}
      />

      {/* <SendMailModal
        toggleMailModal={toggleMailModal}
        mailContent={mailContent}
        isOpenMailModal={isOpenMailModal}
      /> */}
    </div>
  );
}
