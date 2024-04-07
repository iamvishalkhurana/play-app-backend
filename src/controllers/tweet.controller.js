import mongoose, { isValidObjectId } from "mongoose";

import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.model.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet

  const { content } = req.body;

  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken -watchHistory"
  );

  if (!user) {
    throw new ApiError(400, "User does not exist");
  }

  if (!content) {
    throw new ApiError("Content is required");
  }

  const tweet = await Tweet.create({
    owner: user,
    content: content,
  });

  if (!tweet) {
    throw new ApiError(500, "Error occured while posting tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweeted successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid userId");
  }

  const tweets = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "tweet",
        as: "likeDetails",
        pipeline: [
          {
            $project: {
              likedBy: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likeDetails",
        },
        ownerDetails: {
          $first: "$ownerDetails",
        },
        isLiked: {
          $cond: {
            if: { $in: [req.user?._id, "$likeDetails.likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        content: 1,
        ownerDetails: 1,
        likesCount: 1,
        createdAt: 1,
        isLiked: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError("Invalid tweet id");
  }

  const { content } = req.body;

  tweet.content = content;
  const newTweet = await tweet.save(
    { validateBeforeSave: false },
    { new: true }
  );

  if (!newTweet) {
    throw new ApiError(500, "Error occured while updating tweet");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, newTweet, "Tweet Updated Successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  const isTweetDeleted = await Tweet.deleteOne({
    _id: new mongoose.Types.ObjectId(tweetId),
  });

  if (!isTweetDeleted.acknowledged) {
    throw new ApiError(500, "Error occured while deleting tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, isTweetDeleted, "Tweet Deleted Successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
