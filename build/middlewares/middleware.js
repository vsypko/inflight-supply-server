import jwt from "jsonwebtoken";
export function authMiddleware(role) {
    return (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader)
                throw { status: 401, data: "Unauthorized request" };
            const token = authHeader.split(" ")[1];
            if (!token)
                throw { status: 401, data: "Unauthorized request" };
            const tokenData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            if (!tokenData)
                throw { status: 401, data: "Unauthorized request" };
            if (tokenData.role > role)
                throw { status: 401, data: "Unauthorized request" };
            next();
        }
        catch (e) {
            throw { status: 401, data: "Unauthorized request" };
        }
    };
}
export function errorMiddleware(err, req, res, next) {
    res.status(err.status).json(err.data);
}
//# sourceMappingURL=middleware.js.map