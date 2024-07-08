const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index', { books: null });
});

app.get('/search', async (req, res) => {
    const query = req.query.query;
    try {
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
        const books = response.data.items.map(book => {
            const description = book.volumeInfo.description || 'No description available.';
            const truncatedDescription = description.length > 100 ? description.substring(0, 100) + '...' : description;
            const amazonSearchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(book.volumeInfo.title + ' ' + (book.volumeInfo.authors ? book.volumeInfo.authors.join(' ') : ''))}`;

            return {
                ...book,
                volumeInfo: {
                    ...book.volumeInfo,
                    truncatedDescription,
                    fullDescription: description,
                    isTruncated: description.length > 100,
                    amazonSearchUrl
                }
            };
        });
        res.render('index', { books });
    } catch (error) {
        console.error(error);
        res.render('index', { books: [] });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
