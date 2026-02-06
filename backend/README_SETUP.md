# Project Setup & Database Migration

> [!IMPORTANT]
> **ACTION REQUIRED**: The backend has been upgraded to use a professional database (MongoDB). You MUST install MongoDB for the app to work.

## 1. Install MongoDB (Required for Local Use)
Since you want the "best" professional setup, the app no longer uses text files to store data.
1.  Download **MongoDB Community Server**: [Download Link](https://www.mongodb.com/try/download/community)
2.  Install it (Keep defaults, ensure "Install MongoDB as a Service" is checked).
3.  Download **MongoDB Compass** (GUI to view data) - usually included in installer.
4.  Once installed, the app will automatically connect to `mongodb://localhost:27017/school_db`.

## 2. Migrate Your Data
I have created a script to move your old JSON data into the new database.
After installing MongoDB, run this command in your terminal:
```bash
cd backend
node seed.js
```
You should see: "Data Seeding Completed Successfully."

## 3. Deployment (Making it Live)
To make the site live (`www.gbsssjere.com`):
1.  **Database**: Create a free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas). Get your connection string.
2.  **Backend**: Deploy this `backend` folder to **Render** or **Railway**. Add environment variable `MONGO_URI`.
3.  **Frontend**: Deploy the `frontend` folder to **Vercel**.

## Why this change?
- **Stability**: No more lost data on server restarts.
- **Scalability**: Can handle thousands of students.
- **Security**: Professional standard for web apps.
