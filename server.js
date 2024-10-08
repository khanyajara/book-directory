const http = require('http');
const url = require('url');
const { parse } = require('querystring');

const PORT = 3000;
let books = [];

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;

    res.setHeader('Content-Type', 'application/json');

    // Handle routes
    if (parsedUrl.pathname === '/books') {
        switch (method) {
            case 'GET':
                handleGetBooks(req, res);
                break;
            case 'POST':
                handleAddBook(req, res);
                break;
            default:
                res.writeHead(405);
                res.end(JSON.stringify({ message: 'Method Not Allowed' }));
        }
    } else if (parsedUrl.pathname.startsWith('/books/')) {
        const isbn = parsedUrl.pathname.split('/')[2];
        switch (method) {
            case 'GET':
                handleGetBook(req, res, isbn);
                break;
            case 'PUT':
                handleUpdateBook(req, res, isbn);
                break;
            case 'DELETE':
                handleDeleteBook(req, res, isbn);
                break;
            default:
                res.writeHead(405);
                res.end(JSON.stringify({ message: 'Method Not Allowed' }));
        }
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ message: 'Not Found' }));
    }
});

const handleGetBooks = (req, res) => {
    res.writeHead(200);
    res.end(JSON.stringify(books));
};

const handleGetBook = (req, res, isbn) => {
    const book = books.find(b => b.ISBN === isbn);
    if (!book) {
        res.writeHead(404);
        return res.end(JSON.stringify({ message: 'Book Not Found' }));
    }
    res.writeHead(200);
    res.end(JSON.stringify(book));
};

const handleAddBook = (req, res) => {
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const book = JSON.parse(body);
        const validationError = validateBook(book);
        if (validationError) {
            res.writeHead(400);
            return res.end(JSON.stringify({ message: validationError }));
        }
        books.push(book);
        res.writeHead(201);
        res.end(JSON.stringify(book));
    });
};

const handleUpdateBook = (req, res, isbn) => {
    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const updatedBook = JSON.parse(body);
        const index = books.findIndex(b => b.ISBN === isbn);
        if (index === -1) {
            res.writeHead(404);
            return res.end(JSON.stringify({ message: 'Book Not Found' }));
        }

        const validationError = validateBook(updatedBook);
        if (validationError) {
            res.writeHead(400);
            return res.end(JSON.stringify({ message: validationError }));
        }

        books[index] = updatedBook;
        res.writeHead(200);
        res.end(JSON.stringify(updatedBook));
    });
};

const handleDeleteBook = (req, res, isbn) => {
    const index = books.findIndex(b => b.ISBN === isbn);
    if (index === -1) {
        res.writeHead(404);
        return res.end(JSON.stringify({ message: 'Book Not Found' }));
    }
    books.splice(index, 1);
    res.writeHead(204);
    res.end();
};

const validateBook = (book) => {
    if (!book.title || !book.author || !book.publisher || !book.publishedDate || !book.ISBN) {
        return 'All fields are required';
    }
    if (isNaN(book.ISBN)) {
        return 'ISBN must be a number';
    }
    return null;
};

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
