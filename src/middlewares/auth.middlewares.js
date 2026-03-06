import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try {
        let token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No token provided" });
        }

        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            console.log("Decoded token:", decoded);

            const user = await User.findById(decoded.userId).select("-password");
            if (!user) {
                return res.status(403).json({ message: "Forbidden - User not found" });
            }

            req.user = user;
            next();
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Unauthorized - Token expired" });
            }
            return res.status(401).json({ message: "Unauthorized - Invalid token" });
        }
    } catch (error) {
        console.error("Error verifying token in protectRoute middleware:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
