export const useFileType = (file) => {
  if (!file) {
    return {
      isImage: false,
      isVideo: false,
      isUnknown: true,
    };
  }

  if (typeof file === "string" && file.startsWith("data:")) {
    const isImage = file.startsWith("data:image");
    const isVideo = file.startsWith("data:video");

    return {
      isImage,
      isVideo,
      isUnknown: !isImage && !isVideo,
    };
  }

  const fileName =
    typeof file === "string" ? file : file.name || file?.type || "";

  const lower = fileName.toLowerCase();

  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".webp",
    ".svg",
  ];
  const videoExtensions = [".mp4", ".webm", ".ogg", ".avi", ".mov", ".mkv"];

  const matchExtension = (exts) => exts.some((ext) => lower.endsWith(ext));

  const isImage = matchExtension(imageExtensions);
  const isVideo = matchExtension(videoExtensions);

  return {
    isVideo,
    isImage,
    isUnknown: !isVideo && !isImage,
  };
};
