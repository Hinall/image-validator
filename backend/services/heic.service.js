import heicConvert from "heic-convert";

export const convertHeicToJpeg = async (file) => {
  if (
    file.mimetype !== "image/heic" &&
    file.mimetype !== "image/heif"
  ) {
    return file;
  }

  const outputBuffer = await heicConvert({
    buffer: file.buffer,
    format: "JPEG",
    quality: 1,
  });

  return {
    ...file,
    buffer: outputBuffer,
    mimetype: "image/jpeg",
    originalname: file.originalname.replace(
      /\.(heic|heif)$/i,
      ".jpg"
    ),
  };
};