import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body;

    if(!content || content.trim() === ""){
        throw new ApiError(400, "Content is required");
    }

    if(content.length > 280){
        throw new ApiError(400,"Tweet Content Cannot Exceed 280 charachters");
    }

    const tweet = await Tweet.create({
        content: content.trim(),
        owner: req.user._id
    });

    const populatedTweet = await Tweet.findById(tweet._id).populate(
        "owner",
        "username avatar fullName"
    );


    return res.status(201).json(
    new ApiResponse(201, populatedTweet, "Tweet created successfully")
    );

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User ID format");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const tweets = await Tweet.find({ owner: userId })
        .sort({ createdAt: -1 }) // Newest first
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .populate("owner", "username avatar fullName");

    if(!tweets){
        throw new ApiError(404, "Tweet Not Found");
    }

    const totalTweets = await Tweet.countDocuments({ owner: userId });
    const totalPages = Math.ceil(totalTweets / parseInt(limit));

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                tweets,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalTweets,
                    hasNext: parseInt(page) < totalPages,
                    hasPrev: parseInt(page) > 1,
                    limit: parseInt(limit)
                }
            },
            "User tweets fetched successfully"
        )
    );
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}