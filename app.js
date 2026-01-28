const express = require("express");
const app = express();
app.use(express.json());
const {open} = require("sqlite");
const sqlite3 = require('sqlite3');

const path = require('path');
const dbPath = path.join(__dirname, 'goodreads.db');

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '..', 'frontend')));

let db = null;

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
});
  
const intailizeDBAndServer = async (request, response) => {
    try{
        db = await open ({
            filename: dbPath,
            driver: sqlite3.Database,
        });
        app.listen(3000, () => {
            console.log("Server Running at http://localhost:3000/books/");
        })
    } catch (e) {
        console.log(`DB Server : ${e.message}`);
        process.exit(1);
    }
}
intailizeDBAndServer();

//GET BOOKS API
app.get("/books", async (req, res) => {
  const books = await db.all(`
    SELECT 
      book_id,
      title,
      author_id,
      rating,
      rating_count,
      review_count,
      description,
      image_url,
      pdf_url
    FROM book
  `);
  res.send(books);
});

  

//SEARCH BOOKS API
app.get("/books/search", async (request, response) => {
    const { query, rating } = request.query;
    let searchQuery = `SELECT * FROM book WHERE 1=1`;
    
    if (query) {
        searchQuery += ` AND title LIKE '%${query}%'`;
    }
    
    if (rating) {
        searchQuery += ` AND rating >= ${rating}`;
    }
    
    searchQuery += ` ORDER BY book_id`;
    
    const books = await db.all(searchQuery);
    response.send(books);
});

//GET BOOKS API
app.get("/books/:bookId", async (request, response) => {
  const { bookId } = request.params;
  const getBookQuery = `
    SELECT 
      book_id,
      title,
      author_id,
      rating,
      rating_count,
      review_count,
      description,
      image_url,
      pdf_url
    FROM book
    WHERE book_id = ${bookId};
  `;
  const bookQuery = await db.get(getBookQuery);
  response.send(bookQuery);
});


//ADD BOOK API
app.post("/books", async (req, res) => {
  const { title, author_id, rating, image_url, description, pdf_url } = req.body;

  await db.run(`
    INSERT INTO book (
      title,
      author_id,
      rating,
      image_url,
      description,
      pdf_url
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `, [title, author_id, rating, image_url, description, pdf_url]);

  res.send("Book Added");
});
  

//UPDATE BOOK API
/*app.put("/books/:bookId", async (req, res) => {
  const { bookId } = req.params;
  const { title, authorId, rating, imageUrl } = req.body;

  await db.run(
    `UPDATE book
     SET title = ?, author_id = ?, rating = ?, image_url = ?
     WHERE book_id = ?`,
    [title, authorId, rating, imageUrl, bookId]
  );

  res.send({ message: "Book Updated Successfully" });
}); */
//UPDATE BOOK API
app.put("/books/:bookId", async (req, res) => {
  const { bookId } = req.params;
  const { title, authorId, rating, imageUrl, description, pdfUrl } = req.body;

  try {
    await db.run(
      `UPDATE book
       SET title = ?, author_id = ?, rating = ?, image_url = ?, description = ?, pdf_url = ?
       WHERE book_id = ?`,
      [title, authorId, rating, imageUrl, description, pdfUrl, bookId]
    );
    res.json({ message: "Book Updated Successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

  

//DELETE BOOK API
app.delete("/books/:bookId", async (request, response ) => {
    const {bookId} = request.params;
    const deleteBookQuery = `DELETE FROM book WHERE book_id = ${bookId};`;
    await db.run(deleteBookQuery);
    response.send("Deleted Book Successfully");
});

//GET AUTHOR BOOKS API
app.get("/authors/:authorId/books/", async(request, response) => {
    const {authorId} = request.params;
    const getAuthorBooksQuery = `SELECT * FROM book WHERE author_id = '${authorId}';`;
    const authorBook = await db.all(getAuthorBooksQuery);
    response.send(authorBook);
});

//