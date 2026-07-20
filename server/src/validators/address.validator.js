import { z } from "zod";
import { ADDRESS_TYPES } from "../models/Address.js";

const addressBodySchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),

  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Invalid phone number"),

  houseNumber: z.string().trim().min(1, "House / Flat number is required").max(150),

  landmark: z.string().trim().max(150).optional().or(z.literal("")),

  formattedAddress: z.string().trim().min(5, "Address is required").max(500),

  city: z.string().trim().min(2, "City is required").max(100),

  state: z.string().trim().min(2, "State is required").max(100),

  postalCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Invalid postal code"),

  country: z.string().trim().default("India"),

  placeId: z.string().trim().optional().or(z.literal("")),

  location: z
    .object({
      latitude: z.number().min(-90).max(90),

      longitude: z.number().min(-180).max(180),
    })
    .optional(),

  addressType: z.enum(Object.values(ADDRESS_TYPES)).optional(),

  isDefault: z.boolean().optional(),
});

export const createAddressSchema = z.object({
  body: addressBodySchema,
});

export const updateAddressSchema = z.object({
  body: addressBodySchema.partial(),
});
