import crypto from "crypto";

const DEFAULT_EXP_MINUTES = 60;

export const generateResetToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  return token;
};

export const getResetExpiration = () => {
  const minutes =
    Number(process.env.RESET_TOKEN_EXP_MINUTES) || DEFAULT_EXP_MINUTES;
  return new Date(Date.now() + minutes * 60 * 1000);
};
