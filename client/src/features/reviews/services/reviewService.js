import api from "@/lib/axios";

export const getProductReviews = async (productId, params = {}) => {
  const response = await api.get(`/reviews/products/${productId}`, {
    params,
  });

  return response.data.data;
};

export const getReviewStatus = async (productId) => {
  const response = await api.get(`/reviews/products/${productId}/review-status`);

  return response.data.data;
};

export const createReview = async (productId, formData) => {
  const response = await api.post(`/reviews/products/${productId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
};

export const updateReview = async (reviewId, formData) => {
  const response = await api.patch(`/reviews/${reviewId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
};

export const deleteReview = async (reviewId) => {
  const response = await api.delete(`/reviews/${reviewId}`);

  return response.data.data;
};
