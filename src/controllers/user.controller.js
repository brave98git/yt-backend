import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary ,deleteFromCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch {
    throw new ApiError(
      500,
      "Something Went Wrong While Generating Refresh and Access Token"
    );
  }
};

//register
const registerUser = asyncHandler(async (req, res) => {
  //step1:  get user details from frontend
  //step2:  validation - not empty
  //step3:  check if user already exists: username , email
  //step4:  check for images, check for avatar
  //step5:  upload them to cloudinary , avatar
  //step6:  create user object --create entry in db
  //step7:  remove password and refresh token field from response
  //step8:  check for user creation
  //step9:  return res

  //m1: validation
  // if(fullName === ""){
  //     throw new ApiError(400, "Full name is required");
  // }

  //m2: validation
  // if (
  //     [fullName, email , username , password ].includes("")
  // ) {
  //     throw new ApiError(400, "All fields are required");
  // }

  //m3: validation
  //step1 : take from frontend
  const { fullName, email, username, password } = req.body;
  // console.log("email:", email);
  // console.log("username:", username);
  // console.log("password:", password);
  // console.log("fullName:", fullName);
  // console.log("req.files:", req.files);
  // console.log("req.files.avatar:", req.files?.avatar);
  // console.log("req.files.coverImage:", req.files?.coverImage);

  //step2

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //step3
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists with this username or email");
  }

  //step4
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  //console.log("req.files:", req.files);
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  //step5
  const avatar = await uploadToCloudinary(avatarLocalPath);
  const coverImage = await uploadToCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(500, "Error while uploading avatar image");
  }

  //step6
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  //step7
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //step8
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating user");
  }

  //step9
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

//login
const loginUser = asyncHandler(async (req, res) => {
  //step1: get user feilds email and pass
  //step2: fetch database
  //step3: check whether user present or not
  //step4: if yes login the user
  //step5: return res

  //or

  //req body -> data
  //username or email
  //find the user
  //password check
  //access and referesh token
  //send cookies(secure cookies)

  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User Does Not Exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Password Incorrect");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

//logout
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"));
});

//refresh access token
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.RERRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token Is Expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access Token Refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
});

//change current password
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changes Successfully"));
});

//get current user
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(200, req.user, "current user fetched successfully");
});

//update account details
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email: email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account Details Updated Successfully"));
});

//update avatar
const updateUserAvatar = asyncHandler(async(req,res)=>{
  const avatarLocalPath = req.file?.path;
  if(!avatarLocalPath){
    throw new ApiError(400, "Avatar is missing");
  }

  const oldAvatar = user?.avatar;

  const avatar = await uploadToCloudinary(avatarLocalPath);

  if(!avatar.url){
    throw new ApiError(500, "Error while uploading avatar image");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        avatar: avatar.url
      }
    },
    {
      new: true
    }
  ).select("-password");


  if(oldAvatar){
    await deleteFromCloudinary(oldAvatar);
  }

  return res.status(200).json(new ApiResponse(200,user,'Avatar Image Uploaded Successfully'))

})

//update coverImage
const updateUsercoverImage = asyncHandler(async(req,res)=>{
  const coverImageLocalPath = req.file?.path;
  if(!coverImageLocalPath){
    throw new ApiError(400, "CoverImg is missing");
  }

  const oldCoverImage = user?.coverImage;

  const coverImage = await uploadToCloudinary(coverImageLocalPath);

  if(!coverImage.url){
    throw new ApiError(500, "Error while uploading Cover image");
  }

  const user  =  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        coverImage: coverImage.url
      }
    },
    {
      new: true
    }
  ).select("-password");

  if(oldCoverImage){
    await deleteFromCloudinary(oldCoverImage);
  }

  return res.status(200).json(new ApiResponse(200,user,'Cover Image Uploaded Successfully'))
})


const getUserChannelProfile = asyncHandler(async(req,res)=> {
  const {username} = req.params;

  if(!username?.trim()){
    throw new ApiError(44,"Username is Missing");
  }

  const channel = await User.aggregate([
    {
      $match:{
        username: username?.toLowerCase()
      }
    },
    {
      $lookup:{
        from:"subscriptions", //when stored to db Subscription -> subscriptions
        localField:"_id",
        foreignField:"channel",
        as:"subscribers"
      }
    },
    {
      $lookup:{
        from:"subscriptions", //when stored to db Subscription -> subscriptions
        localField:"_id",
        foreignField:"subscriber",
        as:"subscribedTo"
      }
    },
    {
      $addFields:{
        subscribersCount: {
          $size:"$subscribers"
        },
        $channelsSubscribedToCount:{
          $size:"subscribedTo"
        },
        $isSubscribed:{
          $cond: {
            if: {$in: [req.user?._id, "$subscribers.subscriber"]},
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project:{
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      }
    }
  ])

  if(!channel?.length){
    throw new ApiError(404,"Channel Does Not Exists");
  }

  return res.status(200).json(200,channel[0],"User Channel Fetched Successfully");

})


const getWatchHistory = asyncHandler(async(req,res)=>{
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup:{
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline:[ //subpipelines
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1
                  }
                }
              ]
            }
          },
          {
            $addFields:{
              owner: {
                $first: "$owner"//or using array elements at.
              }
            }
          }
        ]
      }
    }
  ])

  return res.status(200).json(new ApiResponse(200 , user[0].watchHistory,"Watch History Fetched Successfully"))
})


export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUsercoverImage,
  getUserChannelProfile,
  getWatchHistory
};