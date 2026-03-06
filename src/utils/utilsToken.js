import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Function to generate access and refresh tokens
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new ApiError(404, "User not found");

        const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
        const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });

        user.accessToken = accessToken;
        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Error generating tokens");
    }
};

export { generateAccessAndRefreshToken };
