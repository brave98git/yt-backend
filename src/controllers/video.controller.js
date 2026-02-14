import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;
  //TODO: get all videos based on query, sort, pagination

  if (userId && !isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid userId");
  }

  const filter = {isPublished: true};

  if(userId) {
    filter.owner = userId;
  }

  if(query){
    filter.$or = [
        {title: {$regex: query, $options: "i"}}, //case insensitive search
        {description: {$regex: query, $options: "i"}}
    ];
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortType.toLowerCase() === "asc" ? 1 : -1;

  const videos = await Video.find(filter)
  .sort(sortOptions)
  .skip((parseInt(page) - 1) * parseInt(limit))
  .limit(parseInt(limit))
  .populate("owner","username avatar fullName");

  const totalVideos = await Video.countDocuments(filter);
  const totalPages = Math.ceil(totalVideos / parseInt(limit));
  return res.status(200).json(
        new ApiResponse(
            200,
            {
                videos,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalVideos,
                    hasNext: parseInt(page) < totalPages,
                    hasPrev: parseInt(page) > 1,
                    limit: parseInt(limit)
                }
            },
            "Videos fetched successfully"
        )
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }
  const videoLocalPath = req.files?.videoFile[0]?.path;
  if (!videoLocalPath) {
    throw new ApiError(400, "Video file is required");
  }
  const video = await uploadToCloudinary(videoLocalPath);
  if (!video) {
    throw new ApiError(400, "Video upload failed");
  }
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail file is required");
  }
  const thumbnail = await uploadToCloudinary(thumbnailLocalPath);
  if (!thumbnail) {
    throw new ApiError(400, "Thumbnail upload failed");
  }
  const newVideo = await Video.create({
    title,
    description,
    videoFile: video.url,
    thumbnail: thumbnail.url,
    duration: video.duration || 0,
    owner: req.user._id,
  });
  if (!newVideo) {
    throw new ApiError(400, "Video upload failed");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, newVideo, "Video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
