import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Tweet } from "../models/tweet.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400,"VideoId is required")
    }

    const likedVideo = await Like.findOne({
        video: videoId,
        likedby: req.user._id
    })
    if(likedVideo){
        await Like.findByIdAndDelete(likedVideo._id)
        return res.status(200).json(new ApiResponse(200,{}, "Video unliked"))
    }
    await Like.create({
        video: videoId,
        likedby: req.user._id
    })
    return res.status(200).json(new ApiResponse(200,{}, "Video liked"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!commentId || !isValidObjectId(commentId)){
        throw new ApiError(400,"CommentId is required")
    }
    const likedComment = await Like.findOne({
        comment: commentId,
        likedby: req.user._id
    })
    if(likedComment){
        await Like.findByIdAndDelete(likedVideo._id)
        return res.status(200).json(new ApiResponse(200,{}, "Comment unliked"))
    }
    await Like.create({
        comment: commentId,
        likedby: req.user._id
    })
    return res.status(200).json(new ApiResponse(200,{}, "Comment liked"))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!tweetId || !isValidObjectId(tweetId)){
        throw new ApiError("Tweet Is Required");
    }

    const likedTweet = await Tweet.findOne({
        tweet: tweetId,
        likedby: req.user._id
    })

    if(likedTweet){
        await Like.findByIdAndDelete(likedTweet._id)
        return res.status(200).json(new ApiResponse(200,{}, "Tweet unliked"))
    }
    await Like.create({
        tweet: tweetId,
        likedby: req.user._id
    })
    return res.status(200).json(new ApiResponse(200,{}, "Tweet liked"))

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likedVideos = await Like.find({
        likedby: req.user._id
    }).populate({
        path: "video",
        model: "Video"
    })
    return res.status(200).json(new ApiResponse(200,likedVideos, "Liked Videos"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}