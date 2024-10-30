import { ServerActionValidationError } from "./server-action-response";

export const formatResponseError = (
  enterprise: string,
  response: Response
): ServerActionValidationError => {
  let message = response.statusText;

  if (response.status === 404) {
    message = `Enterprise with the name ${enterprise} was not found`;
  }

  if (response.status === 401) {
    message =
      "Authorization failed. Please verify that you have provided the correct token and ensure it has not expired.";
  }

  return {
    status: "ERROR",
    errors: [{ message }],
  };
};

export const unknownResponseError = (
  e: unknown
): ServerActionValidationError => {
  console.error(e);
  return {
    status: "ERROR",
    errors: [{ message: "Failed to fetch data" }],
  };
};
