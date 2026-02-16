import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId || !isValidObjectId(channelId)) {
    throw new ApiError(400, "Channel ID is required");
  }

  const videoStats = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $group: {
        _id: "$owner",
        totalViews: { $sum: "$views" },
        totalVideos: { $sum: 1 },
      },
    },
  ]);

  const subscriberCount = await Subscription.countDocuments({
    channel: new mongoose.Types.ObjectId(channelId),
  });

  const totalLikes = await Like.countDocuments({
    video: {
      $in: await Video.find({ owner: channelId }).distinct("_id"),
    },
  });

  if (!videoStats || videoStats.length === 0) {
    throw new ApiError(404, "Channel stats not found");
  }

  const channelStats = {
    ...videoStats[0],
    totalSubscribers: subscriberCount,
    totalLikes: totalLikes,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, channelStats, "Channel stats fetched successfully")
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId || !isValidObjectId(channelId)) {
    throw new ApiError(400, "Channel ID is required");
  }

  const channelVideos = await Video.find({
    owner: new mongoose.Types.ObjectId(channelId),
  }).populate({
    path: "likes",
    select: "_id",
  });

  const videosWithLikeCount = await Promise.all(
    channelVideos.map(async (video) => {
      const likeCount = await Like.countDocuments({ video: video._id });
      return {
        ...video.toObject(),
        likeCount: likeCount,
      };
    })
  );

  if (!videosWithLikeCount || videosWithLikeCount.length === 0) {
    throw new ApiError(404, "Channel videos not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        videosWithLikeCount,
        "Channel videos fetched successfully"
      )
    );
});

export { getChannelStats, getChannelVideos };
