import { ImageKit } from "@imagekit/nodejs";
import ApiError from "../utils/ApiError.js";

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

export const uploadImage = async (file, folder = "/general") => {
  try {
    const response = await imagekit.files.upload({
      file: file.buffer.toString("base64"),
      fileName: file.originalname,
      folder,
    });

    return {
      fileId: response.fileId,
      url: response.url,
      name: response.name,
      thumbnailUrl: response.thumbnailUrl,
    };
  } catch (error) {
    throw new ApiError(500, "Failed to upload image");
  }
};

export const deleteImage = async (fileId) => {
  if (!fileId) return;

  await imagekit.files.delete(fileId);
};

export const deleteImages = async (fileIds = []) => {
  await Promise.all(fileIds.map((fileId) => deleteImage(fileId)));
};
