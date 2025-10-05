# Study Notes Sharing App 📚✨

A beautiful, full-stack study notes sharing platform built with **Next.js 15**, **TypeScript**, **MongoDB**, and **shadcn/ui**. Features a cute pink theme and enables students to upload, share, and discover high-quality study notes with admin approval workflow.

## Features

✨ **User Authentication**
- Secure registration and login with JWT tokens
- HTTP-only cookies for session management
- Student ID-based registration

📝 **Note Management**
- Upload study notes with file attachments
- Browse and download approved notes
- Subject categorization
- Download tracking

👮 **Admin Panel**
- Approve or reject note submissions
- View pending uploads
- Moderate content quality

💬 **Comments System**
- Discuss and ask questions on notes
- Community engagement

🎨 **Beautiful UI**
- Cute pink theme with gradients
- Responsive design
- Built with shadcn/ui components
- Smooth animations

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, React 19
- **UI Library**: shadcn/ui, Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with HTTP-only cookies
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ and pnpm (or npm/yarn)
- MongoDB Atlas account or local MongoDB instance

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd thar
```

### 2. Install dependencies

```bash
pnpm install
# or
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with your actual values:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/studynotes?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
NEXT_PUBLIC_API_URL=
```

**Generate a JWT Secret:**

```bash
openssl rand -base64 32
```

Copy the output and use it as your `JWT_SECRET` in `.env.local`.

### 4. Set up MongoDB

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string and add it to `.env.local`

### 5. Run the development server

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create an admin user

After setting up MongoDB, create an admin user by calling the seed API:

```bash
curl -X POST http://localhost:3000/api/seed-admin
```

Or visit `http://localhost:3000/api/seed-admin` in your browser (as a POST request).

**Default Admin Credentials:**
- Email: `admin@studynotes.com`
- Password: `admin123`

⚠️ **Important:** Change the admin password after first login!

### 7. Start using the app!

1. **Register** a regular user account
2. **Upload** some study notes
3. **Login as admin** to approve/reject uploads
4. **Browse** and download approved notes

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── notes/        # Notes CRUD endpoints
│   │   ├── comments/     # Comments endpoints
│   │   └── seed-admin/   # Admin user creation
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   ├── notes/            # Browse notes page
│   ├── upload/           # Upload notes page
│   ├── admin/            # Admin panel
│   ├── profile/          # User profile
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── ui/               # shadcn/ui components
│   └── Navbar.tsx        # Navigation component
├── context/
│   └── AuthContext.tsx   # Authentication context
├── lib/
│   ├── mongodb.ts        # MongoDB connection
│   └── utils.ts          # Utility functions
├── models/
│   ├── User.ts           # User model
│   ├── Note.ts           # Note model
│   └── Comment.ts        # Comment model
└── hooks/
    └── use-toast.ts      # Toast notifications hook
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/session` - Get current session

### Notes
- `GET /api/notes` - Get all notes (filtered by role)
- `POST /api/notes` - Upload a new note
- `PATCH /api/notes` - Update note status (admin only)
- `DELETE /api/notes?noteId=<id>` - Delete a note
- `POST /api/notes/[id]/download` - Track download

### Comments
- `GET /api/comments?noteId=<id>` - Get comments for a note
- `POST /api/comments` - Add a comment
- `DELETE /api/comments?commentId=<id>` - Delete a comment

### Admin
- `POST /api/seed-admin` - Create admin user (development only)

## Database Models

### User
- name, email, password (hashed)
- studentId (unique)
- role (user/admin)
- timestamps

### Note
- title, description, subject
- fileUrl, fileName, fileSize
- uploadedBy (ref: User)
- status (pending/approved/rejected)
- approvedBy (ref: User)
- rejectionReason
- downloads count
- timestamps

### Comment
- noteId (ref: Note)
- userId (ref: User)
- content
- timestamps

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
4. Deploy!

The app will work on any domain since it uses relative API URLs.

### Deploy to Other Platforms

This app works on any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify
- Self-hosted VPS

Just make sure to set the environment variables!

## Cloud-Ready Features

- ✅ Dynamic DNS support (works on any domain)
- ✅ Environment variable based configuration
- ✅ Stateless authentication with JWT
- ✅ MongoDB connection pooling
- ✅ Production-ready error handling
- ✅ CORS friendly

## Development Notes

### File Upload
Currently, the app expects users to upload files to cloud storage (Google Drive, Dropbox, etc.) and paste the public link. For production, consider integrating:
- AWS S3
- Cloudinary
- Firebase Storage
- Azure Blob Storage

### Security Considerations
- Change default admin password immediately
- Use strong JWT secrets in production
- Enable HTTPS in production
- Implement rate limiting for API routes
- Add input validation and sanitization
- Remove the `/api/seed-admin` route in production

## Troubleshooting

**Database Connection Error:**
- Verify your MongoDB connection string
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure the database user has proper permissions

**Authentication Issues:**
- Clear browser cookies
- Verify JWT_SECRET is set in .env.local
- Check if cookies are enabled in your browser

**Build Errors:**
- Delete `.next` folder and `node_modules`
- Run `pnpm install` again
- Clear pnpm cache: `pnpm store prune`

## Contributing

Feel free to open issues or submit pull requests!

## License

MIT

## Made with love

Enjoy building and learning together!
