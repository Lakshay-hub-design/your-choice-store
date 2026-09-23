const RETURN_ADDRESS = {
  name: process.env.RETURN_ADDRESS_NAME,
  phone: process.env.RETURN_ADDRESS_PHONE,
  addressLine1: process.env.RETURN_ADDRESS_LINE1,
  addressLine2: process.env.RETURN_ADDRESS_LINE2 || "",
  city: process.env.RETURN_ADDRESS_CITY,
  state: process.env.RETURN_ADDRESS_STATE,
  postalCode: process.env.RETURN_ADDRESS_POSTAL_CODE,
};

export default RETURN_ADDRESS;
