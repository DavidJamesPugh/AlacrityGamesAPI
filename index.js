console.log("Hello World, lets get building");

require('dotenv').config({path: './fsoenvironment.env'})
const express = require('express');
const app = express();
const cors = require('cors');

const Note = require('./models/note')

const generateId = () => {
    const maxId = notes.length > 0 ? Math.max(...notes.map(n=> Number(n.id))) : 0;
    return String(maxId +1);
}

const requestLogger = (request, response, next) => {
    console.log("Method: ", request.method);
    console.log(Date.now());
    console.log(request.path);
    console.log(request.body);
    console.log("---");
    next();
}


app.use(express.json());
app.use(cors());
app.use(requestLogger);
app.use(express.static('dist'))

app.get('/', (req, res) => {
    res.send('Hello dave')
})
app.get('/api/notes/', (req, res) => {
    Note.find({})
        .then(notes => {
            console.log("Fetched notes:", notes);
            res.json(notes);
        })
        .catch(err => {
            console.error("Error fetching notes:", err);
            res.status(500).send({ error: "Unable to fetch notes" });
        });
});

app.get('/api/notes/:id', (request, response) => {
    Note.findById(request.params.id).then(note =>  {
        response.json(note);
    });
});

app.post('/api/notes', (request, response) => {

    const body = request.body;

    if (!body.content) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const note = new Note({
        content: body.content,
        important: body.important || false

    });

    note.save().then(savedNote => {
        response.json(savedNote);
    });
})

app.delete('/api/notes/:id', (request, response) => {
    Note.deleteOne({_id: request.params.id}).then(() => {
        console.log("Note deleted");
    });
    const id = request.params.id
    notes = notes.filter(n=> n.id !== id)
    response.status(204).end()
})
const PORT = process.env.PORT ||  3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
