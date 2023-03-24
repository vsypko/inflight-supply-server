import jwt from "jsonwebtoken";
let accessToken;
let refreshToken;
export const generateTokens = (payload) => {
    accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
        expiresIn: "10s",
    });
    refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: "30d",
    });
    return {
        accessToken,
        refreshToken,
    };
};
//# sourceMappingURL=token.service.js.map