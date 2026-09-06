import asyncHandler from "../../utils/asyncHandler.js";
import shiprocketService from "./services/shiprocket.service.js";

export const testShiprocketAuth = asyncHandler(async (req, res) => {
  const token = await shiprocketService.getToken();

  return res.status(200).json({
    success: true,
    message: "Shiprocket authentication successful.",
    tokenReceived: Boolean(token),
  });
});

export const testShippingRate = asyncHandler(async (req, res) => {
  const { pickupPostcode, deliveryPostcode, weight, cod, declaredValue, length, breadth, height } =
    req.query;

  const result = await shiprocketService.getCourierServiceability({
    pickupPostcode,
    deliveryPostcode,
    weight: Number(weight),
    cod: cod === "true" || cod === "1",
    declaredValue: declaredValue ? Number(declaredValue) : undefined,
    length: length ? Number(length) : undefined,
    breadth: breadth ? Number(breadth) : undefined,
    height: height ? Number(height) : undefined,
  });

  return res.status(200).json({
    success: true,
    data: result,
  });
});
