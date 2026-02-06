import express from 'express'; // Importing express
import postRoutes from "./routes/post.route.js"; // Importing post routes

const app = express(); // Initializing the express object in a variable called app

app.use("/posts", postRoutes); // Using the post routes with the /posts endpoint

const PORT = process.env.PORT || 5000; // Creating PORT for our server to run with an alternative port in case the other port is not available

/* 
    Starting server below
    You can run the command npm start in your terminal to start it
*/ 
app.listen(PORT, () => {
    console.log(`Server is listening at Port ${PORT}`);   
}); 