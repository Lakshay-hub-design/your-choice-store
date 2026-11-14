import { ImageKit } from "@imagekit/nodejs";

import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

export const uploadImage = async (file, folder = "/general") => {
  if (!file?.buffer) {
    throw new ApiError(400, "Invalid image file.");
  }

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
    logger.error("ImageKit upload failed:", error);

    throw new ApiError(500, "Failed to upload image");
  }
};

export const deleteImage = async (fileId) => {
  if (!fileId) return;

  try {
    await imagekit.files.delete(fileId);
  } catch (error) {
    logger.error(`ImageKit deletion failed for ${fileId}:`, error);

    throw new ApiError(500, "Failed to delete image");
  }
};

export const deleteImages = async (fileIds = []) => {
  const results = await Promise.allSettled(fileIds.map((fileId) => deleteImage(fileId)));

  const failedCount = results.filter((result) => result.status === "rejected").length;

  if (failedCount > 0) {
    logger.error(`ImageKit cleanup failed for ${failedCount} image(s).`);
  }

  return {
    deleted: results.length - failedCount,
    failed: failedCount,
  };
};
