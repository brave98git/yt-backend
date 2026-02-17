# 🎥 YouTube + Twitter Clone - Backend API

A comprehensive backend API that combines YouTube-like video streaming features with Twitter-like social media functionality. Built with Node.js, Express.js, MongoDB, and modern web technologies.

## 🚀 Features

### 📹 Video Platform Features
- **Video Upload & Streaming** with Cloudinary integration
- **Video Management** (CRUD operations with ownership validation)
- **Video Analytics** (Views, Likes, Comments tracking)
- **Playlist System** with smart video concatenation
- **Subscription System** for channel following
- **Dashboard Analytics** with comprehensive channel statistics

### 🐦 Twitter-like Features
- **Tweet System** with 280-character limit
- **Like/Unlike** functionality for tweets
- **Comment System** with nested replies capability
- **User Engagement** tracking and analytics

### 🔐 Authentication & Security
- **JWT-based Authentication** with secure token management
- **Password Hashing** using bcrypt with salt rounds
- **Role-based Access Control** with ownership validation
- **File Upload Security** with Multer middleware
- **CORS Configuration** for cross-origin requests

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcrypt
- **File Storage**: Cloudinary + Multer
- **API Documentation**: Built-in API endpoints
- **Validation**: Mongoose schema validation

## 📦 Dependencies

### Core Dependencies
```bash
express@5.2.1        # Next-gen Express framework
mongoose@9.1.5       # MongoDB object modeling
jsonwebtoken@9.0.3   # JWT authentication
bcrypt@6.0.0         # Password hashing
cloudinary@2.9.0     # Cloud file storage
multer@2.0.2         # File upload handling
```

### Utility Dependencies
```bash
mongoose-aggregate-paginate-v2@1.1.4  # Advanced pagination
cors@2.8.6                            # Cross-origin requests
cookie-parser@1.4.7                   # Cookie handling
dotenv@17.2.3                         # Environment variables
```

## 🏗️ Project Structure

```
Backend/
├── src/
│   ├── controllers/          # Business logic layer
│   ├── models/              # Database schemas
│   ├── routes/              # API route definitions
│   ├── middlewares/         # Custom middleware functions
│   ├── utils/               # Utility functions and classes
│   ├── db/                  # Database connection
│   ├── app.js               Express app configuration
│   └── index.js             Server entry point
├── public/                  # Static files
└── .env                     Environment variables
```

## 🎯 API Endpoints

### 👤 User Management
- `POST /api/v1/users/register` - User registration
- `POST /api/v1/users/login` - User login
- `POST /api/v1/users/logout` - User logout
- `GET /api/v1/users/current-user` - Get current user
- `PATCH /api/v1/users/update-account` - Update user details
- `PATCH /api/v1/users/avatar` - Update avatar image
- `PATCH /api/v1/users/cover-image` - Update cover image

### 📹 Video Management
- `POST /api/v1/videos` - Upload video (with thumbnail)
- `GET /api/v1/videos` - Get all videos (with pagination)
- `GET /api/v1/videos/:videoId` - Get video by ID
- `PATCH /api/v1/videos/:videoId` - Update video details
- `DELETE /api/v1/videos/:videoId` - Delete video
- `PATCH /api/v1/videos/toggle/publish/:videoId` - Toggle publish status

### 🐦 Twitter Features
- `POST /api/v1/tweets` - Create tweet
- `GET /api/v1/tweets/user/:userId` - Get user tweets
- `PATCH /api/v1/tweets/:tweetId` - Update tweet
- `DELETE /api/v1/tweets/:tweetId` - Delete tweet

### 💬 Comment System
- `POST /api/v1/comments/video/:videoId` - Add comment to video
- `GET /api/v1/comments/video/:videoId` - Get video comments
- `PATCH /api/v1/comments/c/:commentId` - Update comment
- `DELETE /api/v1/comments/c/:commentId` - Delete comment

### ❤️ Like System
- `POST /api/v1/likes/toggle/video/:videoId` - Toggle video like
- `POST /api/v1/likes/toggle/comment/:commentId` - Toggle comment like
- `POST /api/v1/likes/toggle/tweet/:tweetId` - Toggle tweet like
- `GET /api/v1/likes/videos` - Get liked videos

### 📋 Playlist Management
- `POST /api/v1/playlists` - Create playlist (smart update)
- `GET /api/v1/playlists/user/:userId` - Get user playlists
- `GET /api/v1/playlists/:playlistId` - Get playlist by ID
- `POST /api/v1/playlists/:playlistId/:videoId` - Add video to playlist
- `DELETE /api/v1/playlists/:playlistId/:videoId` - Remove video from playlist
- `DELETE /api/v1/playlists/:playlistId` - Delete playlist

### 📊 Dashboard Analytics
- `GET /api/v1/dashboard/stats/:channelId` - Get channel statistics
- `GET /api/v1/dashboard/videos/:channelId` - Get channel videos with analytics

### 🔔 Subscription System
- `POST /api/v1/subscriptions/c/:channelId` - Toggle subscription
- `GET /api/v1/subscriptions/u/:subscriberId` - Get channel subscribers
- `GET /api/v1/subscriptions/c/:channelId` - Get subscribed channels

## 🎨 Advanced Features Implemented

### 🔍 Mongoose Aggregation Pipeline
- Advanced data aggregation for analytics
- Multi-stage data processing
- Complex statistical calculations

### 📄 Pagination
- Efficient data pagination
- mongoose-aggregate-paginate-v2 integration
- Query parameter based pagination (?page=1&limit=10)

### 🏷️ Mongoose Virtuals
- Virtual population for related data
- Efficient data relationships
- Optimized database queries

### ⚡ Mongoose Middlewares
- Pre-save hooks for data validation
- Post-save hooks for data processing
- Automated timestamp management

### 📊 Indexing Optimization
- Single field indexing for frequent queries
- Compound indexing for complex queries
- Query performance optimization

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- Cloudinary account for file storage

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd Backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create a `.env` file in the root directory:
```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/your-database-name
CORS_ORIGIN=http://localhost:3000
ACCESS_TOKEN_SECRET=your-super-secret-jwt-token
ACCESS_TOKEN_EXPIRY=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRY=30d
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

4. **Start the development server**
```bash
npm run dev
```

The server will start on `http://localhost:8000`

## 📝 API Usage Examples

### User Registration
```bash
curl -X POST http://localhost:8000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "password": "password123"
  }'
```

### Video Upload
```bash
curl -X POST http://localhost:8000/api/v1/videos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "videoFile=@/path/to/video.mp4" \
  -F "thumbnail=@/path/to/thumbnail.jpg" \
  -F "title=My Awesome Video" \
  -F "description=This is a great video!"
```

### Get Channel Analytics
```bash
curl -X GET http://localhost:8000/api/v1/dashboard/stats/CHANNEL_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🧪 Testing the API

### Using Postman
1. Import the Postman collection
2. Set up environment variables in Postman
3. Start with user registration/login
4. Obtain JWT token for authenticated requests
5. Test various endpoints with proper authentication

### Sample Test Flow
1. Register a new user
2. Login to get JWT token
3. Upload a video
4. Create a tweet
5. Add comments to video
6. Like/comment on content
7. Check dashboard analytics

## 🔧 Development Scripts

```bash
npm run dev      # Start development server with nodemon
```

## 🛡️ Security Features

- **JWT Authentication** with secure token management
- **Password Hashing** using bcrypt with salt rounds
- **File Upload Validation** with Multer middleware
- **CORS Configuration** for controlled cross-origin access
- **Environment Variables** for sensitive configuration
- **Input Validation** with Mongoose schema validation
- **Ownership Verification** for all modify operations

## 📈 Performance Optimizations

- **Database Indexing** for faster queries
- **Aggregation Pipeline** for complex data operations
- **Pagination** for efficient data retrieval
- **Cloudinary CDN** for optimized file delivery
- **Middleware Chaining** for optimized request processing

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🎓 Learning Outcomes

Through building this project, I've mastered:

### Backend Development
- **Express.js 5** with modern middleware patterns
- **RESTful API design** with proper HTTP status codes
- **Error handling** with custom error classes
- **Middleware architecture** with proper chaining

### Database Management
- **Mongoose ODM** with advanced features
- **Aggregation Pipeline** for complex queries
- **Data Relationships** with population and virtuals
- **Indexing Strategies** for performance optimization
- **Schema Design** with validation and middleware

### Authentication & Security
- **JWT implementation** with secure token management
- **Password security** with bcrypt hashing
- **File upload security** with validation
- **CORS configuration** for frontend integration

### Cloud Integration
- **Cloudinary integration** for file storage
- **CDN optimization** for media delivery
- **Environment configuration** for different deployments

### Advanced Features
- **Pagination implementation** with aggregate paginate
- **Real-time analytics** with aggregation pipelines
- **Smart data relationships** with virtual populations
- **Performance optimization** with proper indexing

## 🙋‍♂️ Author

**Samarth Pawar** - Backend Developer

- GitHub: [@your-github](https://github.com/your-github)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/your-profile)

## 💡 Future Enhancements

- [ ] WebSocket integration for real-time features
- [ ] Redis caching for improved performance
- [ ] Elasticsearch for advanced search capabilities
- [ ] Microservices architecture
- [ ] GraphQL API alongside REST
- [ ] Docker containerization
- [ ] Kubernetes deployment
- [ ] CI/CD pipeline implementation

## 🆘 Support

If you have any questions or need help with setup, please open an issue on GitHub or contact the author.

---

**⭐ Star this repo if you found it helpful!**
Also Learnt About Mongoose Aggregation Pipeline.
Then, I Learnt About Mongoose Virtuals Such as Populate.
And Mongoose Middlewares Such as Pre and Post.
Also, I Learnt About Mongoose Indexing Such as Single and Compound Indexing.
