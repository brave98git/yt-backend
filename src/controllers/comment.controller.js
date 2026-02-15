import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
   if (!videoId || !mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video ID format");
  }
  const aggregate = Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
              fullName: 1
            }
          }
        ]
      }
    },
    {
      $unwind: "$owner"
    },
    {
      $sort: { createdAt: -1 }
    }
  ]);
  const options = {
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const comments = await Comment.aggregatePaginate(aggregate, options);
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        comments: comments.docs,
        pagination: {
          currentPage: comments.page,
          totalPages: comments.totalPages,
          totalComments: comments.totalDocs,
          hasNext: comments.hasNextPage,
          hasPrev: comments.hasPrevPage,
          limit: comments.limit
        }
      },
      "Video comments fetched successfully"
    )
  );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const {videoId} = req.params
  const {content} = req.body
  if (!req.body) {
    throw new ApiError(400, "Request body is required");
  }
  
  if(!content){
    throw new ApiError(400, "Comment is required")
  }
  const newComment = await Comment.create({
    video: videoId,
    content,
    owner: req.user._id,
  })
  if(!newComment){
    throw new ApiError(500, "Comment not created")
  }
  res.status(201).json(
    new ApiResponse(
      201,
      newComment,
      "Comment created successfully"
    )
  );
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;

  if (!commentId || !mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid Comment ID format");
  }

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Comment content is required");
  }

  if (content.length > 280) {
    throw new ApiError(400, "Comment content cannot exceed 280 characters");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized - You can only update your own comments");
  }
  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { content: content.trim() },
    {
      new: true,
      runValidators: true
    }
  ).populate("owner", "username avatar fullName");

  return res.status(200).json(
    new ApiResponse(200, updatedComment, "Comment updated successfully")
  );
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  const deletedComment = await Comment.findByIdAndDelete(commentId);
  if (!deletedComment) {
    throw new ApiError(404, "Comment not found");
  }
  res.status(200).json(
    new ApiResponse(
      200,
      deletedComment,
      "Comment deleted successfully"
    )
  );
});

export { getVideoComments, addComment, updateComment, deleteComment };
