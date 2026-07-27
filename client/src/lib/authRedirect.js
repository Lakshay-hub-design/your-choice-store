export const sanitizeReturnTo = (returnTo, fallback = "/") => {
  if (typeof returnTo !== "string" || !returnTo.startsWith("/") || returnTo.startsWith("//")) {
    return fallback;
  }

  return returnTo;
};

export const getLoginUrl = (returnTo = "/") => {
  const safeReturnTo = sanitizeReturnTo(returnTo);

  return `/login?returnTo=${encodeURIComponent(safeReturnTo)}`;
};
