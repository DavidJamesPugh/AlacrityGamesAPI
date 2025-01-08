console.log("Hello World, lets get building");

require('dotenv').config({path: './fsoenvironment.env'})
const express = require('express');
const app = express();
const cors = require('cors');


const requestLogger = (request, response, next) => {
    console.log("Method: ", request.method);
    console.log(Date.now());
    console.log(request.path);
    console.log(request.body);
    console.log("---");
    next();
}

const errorHandler = (error, request, response, next) => {

    if(error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {

        const errors = Object.values(error.errors).map(err => err.message);
        return response.status(400).json({
            error: 'Validation error',
            details: errors,
        });
    }
    next(error);
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}


const connectToDatabase = require('./models/mongodbconnect'); // Import the database connection function
const Note = require('./models/note')
const PhoneNumber = require('./models/phonenumber')
const url = process.env.MONGODB_URI;
connectToDatabase(url);

app.use(express.static('dist'));
app.use(express.json());
app.use(cors());
app.use(requestLogger);

app.get('/', (req, res) => {
    res.send('Hello dave')
})

//Note Region
app.get('/api/notes/', (req, res) => {
    Note.find({})
        .then(notes => {
            res.json(notes);
        })
        .catch(err => {
            res.status(500).send({ error: "Unable to fetch notes" });
        });
});

app.get('/api/notes/:id', (request, response, next) => {
    const entryId = request.params.id;
    Note.findById(entryId).then(note =>  {
        if (note) {
            response.json(note);
        } else {
            response.status(404).end();
        }
    }).catch(error => next(error));
});


app.put('/api/notes/:id', (request, response,next) => {
    const entryId = request.params.id;
    const { content, important } = request.body;

    // Validate the request body
    if (!content) {
        return response.status(400).json({
            error: 'Content missing',
        });
    }

    // Update the note
    Note.findByIdAndUpdate(
        entryId,
        { content, important: Boolean(important) },
        { new: true, runValidators: true, context: 'query' }
    )
        .then(updatedNote => {
            if (updatedNote) {
                response.json(updatedNote);
            } else {
                response.status(404).json({ error: 'Note not found' });
            }
        })
        .catch(error => next(error)); // Pass errors to error handler middleware
});

app.post('/api/notes', (request, response, next) => {

    const body = request.body;

    if (!body.content) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const note = new Note({
        content: body.content,
        important: Boolean(body.important) || false

    });

    note.save().then(savedNote => {
        response.json(savedNote);
    }).catch(error => next(error));
});

app.delete('/api/notes/:id', (request, response,next) => {
    Note.findByIdAndDelete(request.params.id).then(result => {
        console.log("Note deleted");
        response.status(204).end();
    }).catch(error => next(error));
});
//
//

//
//Phone Region
app.get('/api/phonebook/', (req, res,next) => {
    PhoneNumber.find({})
        .then(phoneentry => {
            res.json(phoneentry);
        })
        .catch(err => next(err));
});

app.get('/api/phonebook/:id', (request, response,next) => {
    PhoneNumber.findById(request.params.id).then(entry =>  {
        if(entry){
            response.json(entry);
        } else {
            response.status(404).end();
        }

    }).catch(error => next(error))
});

app.put('/api/phonebook/:id', (request, response, next) => {
    const body = request.body;

    const phoneEntry = {
        name: body.name,
        phone: body.phone
    }

    PhoneNumber.findByIdAndUpdate(request.params.id, phoneEntry, { new:true, runValidators: true, context: 'query' }).then(result => {
        response.json(result);
    }).catch(error => next(error));

});

app.post('/api/phonebook', (request, response,next) => {

    const body = request.body;

    if (!body.name) {
        return response.status(400).json({
            error: 'content missing'
        });
    }

    const phoneentry = new PhoneNumber({
        name: body.name,
        phone: body.phone

    });

    phoneentry.save().then(savedNumber => {
        response.json(savedNumber);
    }).catch(error => next(error));
});

app.delete('/api/phonebook/:id', (request, response,next) => {
    PhoneNumber.findByIdAndDelete(request.params.id).then(result => {

        response.status(204).end();
    }).catch(error => next(error));
});
//

const PORT = process.env.PORT ||  3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});

// handler of requests with unknown endpoint
app.use(unknownEndpoint);
app.use(errorHandler);