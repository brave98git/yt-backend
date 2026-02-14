import mongoose, { isValidObjectId } from "mongoose"
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";

// Middleware to verify JWT and authenticate user
export const verifyJWT = asyncHandler(async (req, _, next) => { //if res is absent in project grade we have to keep it _
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized Request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);


    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    if (!user) {

      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token")
  }
});

// Middleware to verify video ownership
export const verifyVideoOwnership = asyncHandler(async (req, res, next) => {
  // 1. Gets video ID from URL parameters
  // 2. Validates the video ID format
  // 3. Finds the video in database
  // 4. Checks if authenticated user owns the video
  // 5. Throws 403 error if user doesn't own the video
  // 6. Adds video to request object for controller use
  // 7. Calls next() if ownership is verified
  try {
    const { videoId } = req.params;
    
    // Validate video ID
    if (!mongoose.isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid video ID");
    }
    
    // Find the video
    const video = await Video.findById(videoId);
    
    if (!video) {
      throw new ApiError(404, "Video not found");
    }
    
    // Check if the authenticated user owns the video
    if (video.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Unauthorized - You can only modify your own videos");
    }
    
    // Add video to request object for use in controllers
    req.video = video;
    next();
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message || "Video ownership verification failed");
  }
});

