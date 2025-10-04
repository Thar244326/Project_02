# Quick Start Guide 🚀

Get your Study Notes Sharing App running in 5 minutes!

## Step 1: Install Dependencies

```bash
pnpm install
```

## Step 2: Set Up MongoDB

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a **FREE** cluster
3. Create a database user (remember username & password)
4. Click "Network Access" → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
5. Click "Database" → Connect → Connect your application
6. Copy the connection string

## Step 3: Create Environment File

Create `.env.local` in the root folder:

```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/studynotes?retryWrites=true&w=majority
JWT_SECRET=your-random-secret-key-here
NODE_ENV=development
NEXT_PUBLIC_API_URL=
```

**Generate JWT Secret:**
```bash
openssl rand -base64 32
```

## Step 4: Run the App

```bash
pnpm dev
```

Visit: http://localhost:3000

## Step 5: Test the App!

1. **Register** a user account at http://localhost:3000/register
2. **Upload** a note (PDF attachment is optional!)
3. **Browse** the public feed at http://localhost:3000/notes
4. **Comment** and engage with other users' notes!

## Troubleshooting

**Can't connect to MongoDB?**
- Check your username/password in the connection string
- Make sure you whitelisted 0.0.0.0/0 in Network Access
- Verify the database user has read/write permissions

**Dependencies won't install?**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**TypeScript errors?**
- Ignore them for now, they're because packages aren't installed
- They'll disappear after `pnpm install`

**Port 3000 already in use?**
```bash
pnpm dev -- -p 3001
```

## Next Steps

- Change admin password after first login
- Customize the pink theme in `app/globals.css`
- Add more subjects in the upload form
- Integrate real file upload with AWS S3 or Cloudinary
- Deploy to Vercel for free!

## Need Help?

Check the full [README.md](./README.md) for detailed documentation.

Happy coding! 💖
