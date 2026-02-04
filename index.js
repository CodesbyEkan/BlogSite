import express from 'express'; // Importing express

const app = express(); // Initializing the express object in a variable called app

const PORT = process.env.PORT || 5000; // Creating PORT for our server to run with an alternative port in case the other port is not available

/* 
    Starting server below
    You can run the command npm start in your terminal to start it
*/ 
app.listen(PORT, () => {
    console.log(`Server is listening at Port ${PORT}`);   
}); 