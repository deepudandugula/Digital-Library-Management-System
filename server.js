const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());          // allow frontend requests
app.use(express.json());   // parse JSON

// Import books route
const booksRoute = require("./routes/books"); 
app.use("/books", booksRoute); // all /books requests go to books.js

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
