import axios from "axios";
import ApiError from "../../../utils/ApiError.js";

const SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external";

const TOKEN_VALIDITY_MS = 240 * 60 * 60 * 1000; // 240 hours

const TOKEN_BUFFER_MS = 5 * 60 * 1000; // 5 minutes safety buffer

let cachedToken = null;
let tokenExpiresAt = null;

const authenticate = async () => {
  const email = process.env.SHIPROCKET_API_EMAIL;
  const password = process.env.SHIPROCKET_API_PASSWORD;

  if (!email || !password) {
    throw new ApiError(500, "Shiprocket API credentials are not configured.");
  }

  try {
    const response = await axios.post(
      `${SHIPROCKET_BASE_URL}/auth/login`,
      {
        email,
        password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    const token = response.data?.token;

    if (!token) {
      throw new ApiError(502, "Shiprocket authentication succeeded but no token was returned.");
    }

    cachedToken = token;

    tokenExpiresAt = Date.now() + TOKEN_VALIDITY_MS - TOKEN_BUFFER_MS;

    return cachedToken;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("Shiprocket authentication failed:", error.response?.data || error.message);

    throw new ApiError(502, "Unable to authenticate with Shiprocket.");
  }
};

const getToken = async () => {
  const tokenIsValid = cachedToken && tokenExpiresAt && Date.now() < tokenExpiresAt;

  if (tokenIsValid) {
    return cachedToken;
  }

  return authenticate();
};

const invalidateToken = () => {
  cachedToken = null;
  tokenExpiresAt = null;
};

const getCourierServiceability = async ({
  pickupPostcode,
  deliveryPostcode,
  weight,
  cod,
  declaredValue,
  length,
  breadth,
  height,
}) => {
  if (!pickupPostcode) {
    throw new ApiError(400, "Pickup postcode is required.");
  }

  if (!deliveryPostcode) {
    throw new ApiError(400, "Delivery postcode is required.");
  }

  if (!weight || weight <= 0) {
    throw new ApiError(400, "Valid shipment weight is required.");
  }

  const token = await getToken();

  try {
    const params = {
      pickup_postcode: pickupPostcode,
      delivery_postcode: deliveryPostcode,
      cod: cod ? 1 : 0,
      weight,
    };

    if (declaredValue !== undefined) {
      params.declared_value = declaredValue;
    }

    if (length) {
      params.length = length;
    }

    if (breadth) {
      params.breadth = breadth;
    }

    if (height) {
      params.height = height;
    }

    const response = await axios.get(`${SHIPROCKET_BASE_URL}/courier/serviceability/`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      invalidateToken();

      throw new ApiError(502, "Shiprocket authentication expired. Please try again.");
    }

    console.error(
      "Shiprocket courier serviceability failed:",
      error.response?.data || error.message
    );

    throw new ApiError(502, "Unable to calculate shipping rates from Shiprocket.");
  }
};

const shiprocketService = {
  authenticate,
  getToken,
  invalidateToken,
  getCourierServiceability,
};

export default shiprocketService;
