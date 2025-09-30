# UniConnect Learning Hub: Feature Roadmap

This document outlines advanced features to elevate the UniConnect platform for both students and admins. These enhancements will create a modern, engaging, and professional learning environment.

---

## 🚀 Student Features

- **Interactive Course Progress Tracking**  
  Progress bars, completion badges, and visual indicators for each course.

- **Personalized Dashboard**  
  Recommended courses based on interests and activity.

- **In-Course Discussions & Q&A**  
  Comment threads, question/answer sections, and peer interaction.

- **Gamification**  
  Points, leaderboards, achievements, and badges for engagement.

- **Downloadable Certificates**  
  Award certificates upon course completion.

- **Rich Course Content**  
  Embedded videos, quizzes, assignments, and downloadable resources.

- **Notifications**  
  Alerts for new lessons, deadlines, instructor feedback, and announcements.

- **Bookmark/Favorite Courses**  
  Save courses and resume where you left off.

- **Dark Mode Toggle**  
  Accessibility and user preference support.

- **Real-Time Chat**  
  Communicate with instructors or peers instantly.

---

## 🛠️ Admin Features

- **Analytics Dashboard**  
  Visualize user activity, course engagement, and completion rates.

- **Bulk Course/User Management**  
  Import/export, batch actions, and mass updates.

- **Role Management**  
  Assign instructors, moderators, or teaching assistants.

- **Customizable Email Notifications**  
  Send announcements and updates to users.

- **Content Approval Workflow**  
  Review and approve new courses or lessons before publishing.

- **Visual Course Builder**  
  Drag-and-drop interface for creating and organizing course content.

- **Audit Logs**  
  Track changes and user actions for security and transparency.

- **External Tool Integration**  
  Connect with Zoom, Google Drive, and other platforms.

- **Advanced Search & Filtering**  
  Quickly find users, courses, and content.

- **Theming & Branding Controls**  
  Customize the look and feel of the platform.

---

## 🌐 Platform-Wide Features

- **Mobile-Friendly, Responsive Design**  
  Seamless experience on all devices.

- **Accessibility Features**  
  Screen reader support, keyboard navigation, and more.

- **API for Third-Party Integrations**  
  Allow external apps to connect and interact.

- **Multi-Language Support (i18n)**  
  Serve users in their preferred language.

- **Real-Time Updates**  
  WebSockets for notifications, chat, and live content.

- **AI-Powered Recommendations & Auto-Grading**  
  Smart suggestions and automated quiz grading.

---

## Next Steps

We will begin implementing these features, prioritizing those that deliver the most value and engagement.  
**To get started, please specify which feature you want to work on first!**

---

## Google OAuth Setup & Usage

### 1. Enable Google OAuth in Supabase
- Go to your Supabase project dashboard.
- Navigate to "Authentication" > "Providers".
- Enable "Google" and enter your Google OAuth Client ID and Client Secret (obtain these from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)).
- Set the redirect URL to: `https://your-frontend-domain/` (or `http://localhost:3001/` for local development).

### 2. Configure Environment Variables
- In `backend/.env` and `backend/.env.example`, set:
  ```
  GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id
  GOOGLE_OAUTH_CLIENT_SECRET=your_google_oauth_client_secret
  ```
- In `frontend-1/.env` and `frontend-1/.env.example`, set:
  ```
  VITE_SUPABASE_URL=your_supabase_project_url
  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
  ```

### 3. Usage
- On the login page, click "Sign in with Google".
- You will be redirected to Google, then back to the app with a Supabase session.
- The session is handled automatically; you can access user info via Supabase client.

### 4. Troubleshooting
- Ensure your Supabase project and Google Cloud Console credentials match.
- Make sure redirect URLs are whitelisted in both Supabase and Google Cloud Console.
