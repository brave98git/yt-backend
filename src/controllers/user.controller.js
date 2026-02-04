import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

import { ApiResponse } from "../utils/ApiResponse.js";

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
    [fullName, email, username, password].some(
      (field) => field?.trim() === "")
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
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
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

export { registerUser };
