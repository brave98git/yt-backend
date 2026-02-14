import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js";
import {
  verifyJWT,
  verifyVideoOwnership,
} from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
  .route("/")
  .get(getAllVideos)
  .post(
    upload.fields([
      {
        name: "videoFile",
        maxCount: 1,
      },
      {
        name: "thumbnail",
        maxCount: 1,
      },
    ]),
    publishAVideo
  );

//GET routes for getAllVideos:
// eg.🌐 Example API Calls:
// 1. Get all videos (default):

// ```
// GET http://localhost:8000/api/v1/videos
// ```
// 2. Get page 2 with 20 videos:

// ```
// GET http://localhost:8000/api/v1/videos?page=2&limit=20
// ```
// 3. Search for "music" videos:

// ```
// GET http://localhost:8000/api/v1/videos?query=music
// ```
// 4. Get user's videos sorted by views:

// ```
// GET http://localhost:8000/api/v1/videos?userId=123&sortBy=views&
// sortType=desc
// ```
// 5. Complex search with pagination:

// ```
// GET http://localhost:8000/api/v1/videos?query=tutorial&page=1&limit=5&
// sortBy=createdAt

router
  .route("/:videoId")
  .get(getVideoById)
  .delete(verifyJWT, verifyVideoOwnership, deleteVideo)
  .patch(verifyJWT, verifyVideoOwnership,upload.single("thumbnail"), updateVideo);

//   ### API Usage:
// ```
// GET http://localhost:8000/api/v1/videos/
// :videoId
// ```
// Example:

// ```
// GET http://localhost:8000/api/v1/videos/
// 67f8a1b2c3d4e5f6a7b8c9d0
// ```

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router;
