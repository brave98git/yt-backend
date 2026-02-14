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

  const filter = { isPublished: true };

  if (userId) {
    filter.owner = userId;
  }

  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: "i" } }, //case insensitive search
      { description: { $regex: query, $options: "i" } },
    ];
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortType.toLowerCase() === "asc" ? 1 : -1;

  const videos = await Video.find(filter)
    .sort(sortOptions)
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit))
    .populate("owner", "username avatar fullName");

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
          limit: parseInt(limit),
        },
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

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video Id format");
  }

  const video = await Video.findById(videoId).populate(
    "owner",
    "username avatar fullName email"
  );

  if (!video) {
    throw new ApiError(404, "Video Not Found");
  }

  if (!video.isPublished) {
    //allow owner to view unpublished video
    const isOwner =
      req.user && req.user._id.toString() === video.owner._id.toString();
    if (!isOwner) {
      throw new ApiError(404, "Video not found");
    }
  }

  video.views += 1;
  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched Successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail

  if (!videoId && isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video ID Format");
  }

  const {title,description} = req.body;
  if (!title && !description && !req.file) {
    throw new ApiError(
      400,
      "At least one field (title, description, or thumbnail) is required"
    );
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not Found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "Unauthorized - You can only update your own videos"
    );
  }

  let thumbnailUrl = video.thumbnail;

  if (req.file) {
    const thumbnailLocalPath = req.file.path;
    const thumbnail = await uploadToCloudinary(thumbnailLocalPath);
    if (!thumbnail) {
      throw new ApiError(500, "Thumbnail upload failed");
    }

    thumbnailUrl = thumbnail.url;
  }

  const updateFields = {};
  if (title) updateFields.title = title;
  if (description) updateFields.description = description;
  if (req.file) updateFields.thumbnail = thumbnailUrl;

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: updateFields },
    {
      new: true, // Return the updated document
      runValidators: true, // Run schema validators on update
    }
  ).populate("owner","username avatar fullName");

  return res.status(200).json(
    new ApiResponse(200, updatedVideo, "Video updated successfully")
  );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if(!videoId && !isValidObjectId(videoId)){
    throw new ApiError(400, "Invalid Video ID format");
  }
   
  const deletedVideo = await Video.findByIdAndDelete(videoId);

  return res.status(200).json(
    new ApiResponse(200, deletedVideo, "Video deleted successfully")
  );
  

});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video ID format");
  }

  const video = await Video.findById(videoId);
  
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized - You can only modify your own videos");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: { isPublished: !video.isPublished } },
    { 
      new: true, // Return the updated document
      runValidators: true // Run schema validators
    }
  ).populate("owner", "username avatar fullName");

  const statusMessage = updatedVideo.isPublished 
    ? "Video published successfully" 
    : "Video unpublished successfully";

  return res.status(200).json(
    new ApiResponse(200, updatedVideo, statusMessage)
  );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
