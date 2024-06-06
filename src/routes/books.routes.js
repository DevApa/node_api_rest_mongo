const express = require("express");
const router = express.Router();
const Book = require("../models/books.model");

//Middleware
const getBok = async (req, res, next) => {
    let book;
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).json({
            message: "El ID del libro no es válido"
        });
    }
    try {
        book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({
                message: "El libro no fue encontrado"
            })
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
    res.book = book;
    next();
}

router.get("/", async (req, res) => {
    try {
        const books = await Book.find();
        console.log('GET ALL', books);
        if (books.length === 0) {
            res.status(204).json([]);
        }
        res.json(books);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
})

router.get("/:id", getBok, async (req, res) => {
    res.json(res.book)
})

router.put("/:id", getBok, async (req, res)=> {
    try {
        const book = res.book
        book.title = req.body.title || book.title;
        book.author = req.body.author || book.author;
        book.gender = req.body.gender || book.gender;
        book.publication_date = req.body.publication_date || book.publication_date;

        const updateBook = await book.save(book);
        res.json(updateBook);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
})

router.patch("/:id", getBok, async (req, res)=> {
    if (!req.body.title && !req.body.author && !req.body.gender && !req.body.publication_date){
        res.status(400).json({ 
            message: "Al menos uno de estos campos debe ser enviado: "+
            "Título, Autor, Género o fecha de publicación"
        })
    }
    try {
        const book = res.book
        book.title = req.body.title || book.title;
        book.author = req.body.author || book.author;
        book.gender = req.body.gender || book.gender;
        book.publication_date = req.body.publication_date || book.publication_date;

        const updateBook = await book.save(book);
        res.json(updateBook);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
})

router.delete("/:id", getBok, async (req, res) => {
    try {
        const book = res.book;
        await book.deleteOne({
            _id: book._id
        });
        res.json({
            message: `El libro ${book.title} fue eliminado correctamente`
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
})


router.post("/", async (req, res) => {
    const { title, author, gender, publication_date } = req?.body
    if (!title || !author || !gender || !publication_date) {
        res.status(400).json({
            message: "Los campos titulo, autor, género y fecha son obligatorios"
        })
    } 
    else {
        const book = new Book({
            title,
            author,
            gender,
            publication_date
        })
        try {
            const newBook = await book.save()
            res.status(201).json(newBook)
        }
        catch (err) {
            res.status(400).json({ message: err.message })
        }
    }
})

module.exports = router