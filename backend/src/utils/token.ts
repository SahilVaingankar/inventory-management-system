import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const generateHashedRefreshToken = async (
  userId: string
): Promise<string> => {
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_TOKEN_SECRET!,
    {
      expiresIn: "7d",
    }
  );

  return await bcrypt.hash(refreshToken, 10);
};
