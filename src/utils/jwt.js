import jwt from "jsonwebtoken";

const generateAccessToken = (userId, role, res) => {
  const token = jwt.sign({ id: userId, role }, process.env.JWT_ACCESS_TOKEN, {
    expiresIn: "15m",
  });
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });
};

const generateRefreshToken = (userId, role, version, res) => {
  const token = jwt.sign(
    { id: userId, role, version },
    process.env.JWT_REFRESH_TOKEN,
    {
      expiresIn: "7d",
    }
  );
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const deleteRefreshToken = (res) => {
  res.clearCookie("refreshToken");
};

const deleteAccessToken = (res) => {
  res.clearCookie("accessToken");
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_TOKEN);
};

export {
  generateAccessToken,
  generateRefreshToken,
  deleteRefreshToken,
  deleteAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
};
