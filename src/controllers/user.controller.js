import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { generateAccessAndRefreshToken } from "../utils/utilsToken.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcrypt";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import transporter from "../utils/nodemailer.js";
import fs from "fs";
// Signup Route: Register a new user
const signupUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password, profilePic } = req.body;

    if ([fullName, email, password].some(field => !field?.trim())) {
        throw new ApiError(400, "All fields (Full Name, Email, Password) are required");
    }

    const generatedUsername = username
        ? username.trim().toLowerCase()
        : fullName.trim().toLowerCase().replace(/\s+/g, '_');

    const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: generatedUsername }] });
    if (existingUser) {
        throw new ApiError(409, "Email or Username already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        username: generatedUsername,
        password: hashedPassword,
        profilePic: profilePic || null,
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const mailOptions = {
        from: process.env.SENDER_MAIL,
        to: user.email,
        subject: "Welcome to ChatApp",
        html: `
        <h1>Welcome to ChatApp!</h1>
        <p>Your account has been created successfully.</p>
        <p>To access your account, please click the following link:</p>
        <a href="${process.env.CLIENT_URL}/verify-email/${user._id}">Verify Email</a>
        `,
    };

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    };

    if (!createdUser || !accessToken || !refreshToken) {
        return res.status(500).json(new ApiResponse(500, null, "Error while registering user"));
    }

    try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully to", user.email);
    } catch (error) {
        console.error("Error sending email:", error);
    }

    return res.status(201)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(new ApiResponse(201, createdUser, "User registered successfully"));
});


// Login Route: Authenticate a user
const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!email && !username) {
        throw new ApiError(400, "Email or Username is required");
    }

    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (!user) {
        throw new ApiError(400, "User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    // Exclude password and refreshToken from the response
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Ensure cookies are secure in production
        sameSite: "strict",
    };

    return res.status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"));
});

// Logout Route: Log out a user
const logoutUser = asyncHandler(async (req, res) => {
    try {
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Ensure cookies are secure in production
            sameSite: "strict",
        }; 

        // Clear cookies
        return res.status(200)
            .clearCookie("accessToken", cookieOptions)
            .clearCookie("refreshToken", cookieOptions)
            .json(new ApiResponse(200, {}, "User logged out successfully"));
    } catch (error) {
        throw new ApiError(500, "Logout failed");
    }
});
const updateProfile = asyncHandler(async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic) {
            throw new ApiError(400, "Profile pic is required");
        }

        let uploadResponse; // Declare uploadResponse here to use it across the function

        if (profilePic.startsWith('data:image')) {
            const base64Data = profilePic.split(';base64,').pop();
            const filePath = './temp_image.png'; // Temporary file path

            fs.writeFileSync(filePath, base64Data, { encoding: 'base64' });

            // Upload to Cloudinary
            uploadResponse = await uploadonCloudinary(filePath);

            fs.unlinkSync(filePath); // Clean up temporary file after upload
        } else {
            // Handle non-base64 image data
            uploadResponse = await uploadonCloudinary(profilePic);
        }

        // Ensure the Cloudinary upload was successful
        if (!uploadResponse || !uploadResponse.secure_url) {
            throw new ApiError(500, "Failed to upload image to Cloudinary");
        }

        // Update the user profile with the uploaded image URL
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true }
        );

        res.status(200).json(new ApiResponse(200, updatedUser, "Profile pic updated successfully"));
    } catch (error) {
        console.error("Error updating profile pic:", error.message);
        throw new ApiError(500, "Error updating profile pic");
    }
});

  
  
   
const checkAuth=asyncHandler(async(req,res)=>{
    try{
        const user=req.user;
        console.log("User authenticated successfully ",user);
        console.log("Fininshed")
        res.status(200).json(new ApiResponse(200,user,"User authenticated successfully"));
    }catch(error){
        throw new ApiError(500,"Error checking authentication");
    }
});

const refreshAuthToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }

    try {
        // Verify the refresh token
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.userId).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "User not found");
        }

        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);

        // Set new tokens in cookies
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        };

        return res
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", newRefreshToken, cookieOptions)
            .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed successfully"));

    } catch (error) {
        throw new ApiError(403, "Invalid or expired refresh token");
    }
});

export { signupUser, loginUser, logoutUser ,updateProfile,checkAuth,refreshAuthToken};
