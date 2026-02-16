import mongoose, { Schema } from "mongoose";

const dashboardSchema = new mongoose.Schema(
    {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    channelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Channel",
        required: true
    },
    totalViews: {
        type: Number,
        default: 0
    },
    totalSubscribers: {
        type: Number,
        default: 0
    },
    totalVideos: {
        type: Number,
        default: 0
    },
    totalLikes: {
        type: Number,
        default: 0
    }
  }
)