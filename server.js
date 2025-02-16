const express = require('express'); // idk some tutorial used Express
const connectDB = require('./config/db'); 

const app = express(); 

// connect!!! please
connectDB(); 

app.listen(3000, () => console.log('Server running on port 3000')); 