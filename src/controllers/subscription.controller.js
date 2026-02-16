import mongoose, {isValidObjectId} from "mongoose"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!channelId || !isValidObjectId(channelId)){
        throw new ApiError("Channel Is Required");
    }
    const subscription = await Subscription.findOne({
        channel: channelId,
        subscriber: req.user._id
    })
    if(subscription){
        await Subscription.findByIdAndDelete(subscription._id)
        return res.status(200).json(new ApiResponse(200,{}, "Unsubscribed"))
    }
    await Subscription.create({
        channel: channelId,
        subscriber: req.user._id
    })
    return res.status(200).json(new ApiResponse(200,{}, "Subscribed"))
})


const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    
    if(!subscriberId || !isValidObjectId(subscriberId)){
        throw new ApiError(400, "Subscriber ID is required");
    }
    
    const subscribers = await Subscription.find({
        channel: subscriberId
    }).populate({
        path: "subscriber",
        select: "username fullName avatar"
    })
    return res.status(200).json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"))
})


const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params 
    
    if(!channelId || !isValidObjectId(channelId)){
        throw new ApiError(400, "Channel ID is required");
    }
    const subscribedChannels = await Subscription.find({
        subscriber: channelId
    }).populate({
        path: "channel",
        select: "username fullName avatar"
    })
    
    return res.status(200).json(new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}