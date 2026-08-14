# AI-Powered Monitoring System for Diabetic Patients Leveraging MediaPipe Pose Detection Technology

An innovative health monitoring platform that combines computer vision with therapeutic exercise tracking to provide real-time posture correction and personalized health analytics. This project was selected for a college-level hackathon.

## 🌟 Features

### AI-Powered Pose Detection
- Real-time joint angle measurement using MediaPipe Pose with 95% accuracy
- HD camera resolution (1280x720) for precise detection
- Visual feedback with color-coded angle indicators
- Professional skeleton visualization with thick green lines and red joint markers

### Personalized Health Analytics
- BMI calculation and categorization
- Exercise recommendations based on health conditions and BMI
- Multilingual support (English and Kannada) with text-to-speech feedback
- Comprehensive dashboard with exercise statistics and progress tracking

### Data Management
- Cloud database integration with MongoDB Atlas
- Local storage fallback for offline functionality
- User data isolation with separate profiles
- Complete database viewer with CRUD operations

### User Experience
- Modern UI with gradient backgrounds and responsive design
- Three-section layout: Health data form, camera monitoring, exercise information
- Real-time angle display on camera feed
- PDF report generation with performance ratings

## 🛠️ Tech Stack

### Frontend
- HTML5, CSS3, JavaScript
- MediaPipe Pose API for real-time pose estimation
- Canvas API for skeleton visualization

### Backend
- Node.js with Express.js framework
- MongoDB Atlas for cloud database
- Mongoose ODM for data modeling

### Deployment
- Render.com for hosting
- GitHub for version control
- Continuous deployment pipeline

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- Git
- MongoDB Atlas account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Ashoka2005/Smart-Monitoring-With-Therapy-Suggestions.git
cd Smart-Monitoring-With-Therapy-Suggestions
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file with your MongoDB connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority&appName=Cluster0
```

4. Start the server:
```bash
npm start
```

5. Open your browser:
- Main App: http://localhost:3000
- Dashboard: http://localhost:3000/dashboard.html
- Database Viewer: http://localhost:3000/database.html

## 📁 Project Structure

```
├── index.html          # Main application page
├── dashboard.html      # User statistics and progress tracking
├── database.html       # Database viewer with CRUD operations
├── script.js           # Client-side logic and MediaPipe integration
├── server.js           # Backend server with REST APIs
├── knowledge_base.js   # Exercise database and recommendations
├── language.js         # Multilingual support
├── style.css           # Modern UI styling
├── package.json        # Project dependencies and scripts
└── .env               # Environment variables (gitignored)
```

## 🔧 Key Components

### MediaPipe Pose Detection
- Model Complexity: Level 2 (maximum accuracy)
- Detection Confidence: 0.7 threshold
- Tracking Confidence: 0.7 threshold
- HD resolution: 1280x720 camera feed

### Database Schema
- **Users**: Name, email, age, gender
- **Sessions**: Exercise data, reps, accuracy, duration
- **BMI Records**: Weight, height, BMI value, category
- **Progress**: Tracking by health condition

### Supported Health Conditions
- Back Pain
- Knee Pain
- Joint Pain
- Obesity
- Diabetes

## 🌐 Deployment

### Online Access
The application is deployed at:
https://smart-monitoring-with-therapy.onrender.com

### Deployment Process
1. Code pushed to GitHub triggers auto-deployment
2. Render.com builds and deploys the application
3. MongoDB Atlas provides cloud database storage

## 🏆 Achievements

- Selected for college-level hackathon
- Implements advanced AI pose estimation
- Provides comprehensive health monitoring solution
- Features professional-grade UI/UX design

## 📱 Mobile Compatibility

The application is fully responsive and works on:
- Desktop browsers
- Mobile browsers
- Tablet devices

## 🔒 Security

- Environment variables stored in `.env` (gitignored)
- MongoDB Atlas IP whitelisting
- Secure password handling
- HTTPS encryption on deployed version

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- MediaPipe Pose API by Google
- MongoDB Atlas for cloud database
- Render.com for free hosting
- College hackathon organizers