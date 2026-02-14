import multer from "multer";


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
    console.log("File received:", file.originalname);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
    
  },
});

export const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    // Allow only image and video files
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
});
