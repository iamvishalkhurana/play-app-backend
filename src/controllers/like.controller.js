import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const isLiked = await Like.findOne({
    video: new mongoose.Types.ObjectId(videoId),
    likedBy: req.user?._id,
  });

  if (isLiked) {
    const isDeleted = await Like.deleteOne({ _id: isLiked._id });

    if (!isDeleted.acknowledged) {
      throw new ApiError(500, "Error occured while unliking the video");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, isDeleted, "Video unliked successfully"));
  } else {
    const newLike = await Like.create({
      video: videoId,
      likedBy: req.user?._id,
    });

    if (!newLike) {
      throw new ApiError(500, "Error occured while liking the video");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, newLike, "Video liked successfully"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid commentId");
  }

  const isLiked = await Like.findOne({
    comment: new mongoose.Types.ObjectId(commentId),
    likedBy: req.user?._id,
  });

  if (isLiked) {
    const isDeleted = await Like.deleteOne({ _id: isLiked._id });

    if (!isDeleted.acknowledged) {
      throw new ApiError(500, "Error occured while unliking the comment");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, isDeleted, "Comment unliked successfully"));
  } else {
    const newLike = await Like.create({
      comment: commentId,
      likedBy: req.user?._id,
    });

    if (!newLike) {
      throw new ApiError(500, "Error occured while liking the comment");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, newLike, "Comment liked successfully"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweetId");
  }
  const isLiked = await Like.findOne({
    tweet: new mongoose.Types.ObjectId(tweetId),
    likedBy: req.user?._id,
  });

  if (isLiked) {
    const isDeleted = await Like.deleteOne({ _id: isLiked._id });

    if (!isDeleted.acknowledged) {
      throw new ApiError(500, "Error occured while unliking the tweet");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, isDeleted, "Tweet unliked successfully"));
  } else {
    const newLike = await Like.create({
      tweet: tweetId,
      likedBy: req.user?._id,
    });

    if (!newLike) {
      throw new ApiError(500, "Error occured while liking the tweet");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, newLike, "Tweet liked successfully"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: req.user?._id,
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "likedVideo",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
            },
          },
          {
            $unwind: "$owner",
          },
        ],
      },
    },
    {
      $unwind: "$likedVideo",
    },
    {
      $project: {
        likedVideo: {
          _id: 1,
          videoFile: 1,
          thumbnail: 1,
          title: 1,
          description: 1,
          createdAt: 1,
          duration: 1,
          views: 1,
          owner: {
            _id: 1,
            username: 1,
            fullName: 1,
            avatar: 1,
          },
        },
      },
    },
  ]);

  if (!likedVideos) {
    throw new ApiError(500, "Error occured while fetching liked videos");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
