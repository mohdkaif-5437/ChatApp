import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js"
import connectDB from "./utils/db.js";
import cors from "cors";
import { app,server } from "./utils/socket.js";
import path  from "path";
dotenv.config();

const PORT=process.env.PORT;

const __dirname=path.resolve();
app.get("/", (req, res) => {
  res.send("Hello World!");
}); 
app.use(cookieParser());// Parse Cookie header and populate req.cookies with an object keyed by the cookie names.
app.use(express.json({ limit: "10mb" })); // Set limit to 10MB
app.use(express.urlencoded({ limit: "10mb", extended: true })); // For URL-encoded data 

// Enable CORS with various options 


const corsOptions = {
  origin: "https://chat-app-coral-phi.vercel.app", // Allow your frontend origin
  credentials: true, // Allow cookies and authentication headers
};

app.use(cors(corsOptions));

app.use("/api/auth",authRoutes);// Use the auth routes for all routes starting with /api/auth containing signup, login, logout, updateProfile and checkAuth routes
app.use("/api/message",messageRoutes);// Use the message routes for all routes starting with /api/message containing sendMessage and getMessages routes

if(process.env.NODE_ENV=== 'production')
{
  app.use(express.static(path.join(__dirname, '../Frontend/dist')));

  app.get('*',(req,res)=>{
    res.sendFile(path.join(__dirname, "../Frontend","dist","index.html"));
  })
}
server.listen(PORT,'0.0.0.0' ,() => {
  console.log(`Server running at http://localhost:${PORT}`);
  connectDB();
});
