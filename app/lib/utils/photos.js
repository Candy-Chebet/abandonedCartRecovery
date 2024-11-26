// Upload photo files
export const uploadPhotoFiles = async (body) => {
    try {
      const response = await fetch("/uploadFiles", {
        method: "POST",
        body,
      });
  
      const { message, error, data } = await response.json();
      return { message, error, data };
    } catch (err) {
      return { error: true, message: err.message, data: [] };
    }
  };
  
  // Get photo files
  export const getPhotoFiles = async () => {
    try {
      const response = await fetch("/getFiles", {
        method: "GET",
      });
  
      const { message, error, data } = await response.json();
      return { message, error, data };
    } catch (err) {
      return { error: true, message: err.message, data: [] };
    }
  };
  
//   // Send newsletter
//   export const sendNewsletter = async (payload) => {
//     try {
//       const response = await fetch("/sendNewsletter", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       });
  
//       const { message, error, data } = await response.json();
//       return { message, error, data };
//     } catch (err) {
//       return { error: true, message: err.message, data: [] };
//     }
//   };
  
  // Get image dimensions
  export const getImageDimensions = (file) => {
    const url = URL.createObjectURL(file);
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          url,
          file,
        });
        URL.revokeObjectURL(url); // Clean up object URL after usage
      };
      img.onerror = (err) => reject(err);
      img.src = url;
    });
  };
  
  // Validate email
  export const validateEmail = (email) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };
  