import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    // sortBy = created_at,
    // sortType = desc,
    userId,
  } = req.query;
  //TODO: get all videos based on query, sort, pagination

  //   if (!query && !userId) {
  //     throw new ApiError(400, "Query or user id is required");
  //   }
  let videos = null;
  if (!userId) {
    videos = await Video.find()
      .limit(parseInt(limit))
      .skip((page - 1) * limit);
  } else {
    videos = await Video.find({ owner: new mongoose.Types.ObjectId(userId) })
      .limit(parseInt(limit))
      .skip((page - 1) * limit);
  }

  if (videos == null) {
    throw new ApiError(500, "Error occured while fetching videos");
  }

  const totalPages = Math.ceil(videos.length / limit);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { videos, totalPages },
        "Videos fetched successfully"
      )
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Title and description is required");
  }

  // TODO: get video, upload to cloudinary, create video

  console.log(req.files);

  const videoLocalPath = req.files.videoFile[0]?.path;

  const thumbnailLocalPath = req.files.thumbnail[0]?.path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Video file and thumbnail both are required");
  }

  const videoFile = await uploadOnCloudinary(videoLocalPath);
  if (!videoFile) {
    throw new ApiError(500, "Error occurred while uploading video");
  }
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnail) {
    throw new ApiError(500, "Error occurred while uploading thumbnail");
  }

  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    owner: req.user,
    title,
    description,
    duration: videoFile.duration,
  });

  if (!video) {
    throw new ApiError(500, "Internal server error");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  console.log(video);
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideoDetails = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  //TODO: update video details like title, description, thumbnail

  const { title, description } = req.body;

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title,
        description: description,
      },
    },
    { new: true }
  );

  if (!video) {
    console.log(404, "Either video is unavailable or update is not done");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video details updated successfully"));
});

const updateVideoThumbnail = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const thumbnailLocalPath = req.file.path;
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required");
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnail) {
    throw new ApiError(500, "Error occured while uploading on cloudinary");
  }
  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        thumbnail: thumbnail.url,
      },
    },
    { new: true }
  );

  if (!video) {
    console.log(404, "Either video is unavailable or update is not done");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video thumbnail updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const isDeleted = await Video.deleteOne({
    _id: new mongoose.Types.ObjectId(videoId),
  });

  if (!isDeleted.acknowledged) {
    throw new ApiError(500, "Error occured while deleting");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, isDeleted, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const currPublishStatus = video.isPublished;

  video.isPublished = !currPublishStatus;
  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Publish Status toggled"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideoDetails,
  deleteVideo,
  togglePublishStatus,
  updateVideoThumbnail,
};
