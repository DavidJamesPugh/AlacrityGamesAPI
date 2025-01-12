import { test, after, beforeEach } from 'node:test';
import mongoose from 'mongoose';
import supertest from 'supertest';
import app from '../app.js';
import assert from 'assert';
import Note from '../models/note.js';

const api = supertest(app);

const initNotes = [
  {
    content: 'HTML is easy',
    important: false,
  },
  {
    content: 'Browser can execute only JavaScript',
    important: true,
  },
];

beforeEach(async () => {
  await Note.deleteMany({});
  let noteObject = new Note(initNotes[0]);
  await noteObject.save();
  noteObject = new Note(initNotes[1]);
  await noteObject.save();
});

test('Notes as JSON', async () => {
  await api
    .get('/api/notes')
    .expect(201)
    .expect('Content-Type', /application\/json/);
});

test('Two notes exists', async () => {
  const response = await api.get('/api/notes');

  assert.strictEqual(response.body.length, initNotes.length);
});

test('the first note is about HTTP methods', async () => {
  const response = await api.get('/api/notes');

  const contents = response.body.map((e) => e.content);
  assert(contents.includes('HTML is easy'));
});

test('Valid Note Added', async () => {
  const newNote = {
    content: 'Async/Await adding note',
    important: true,
  };

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const response = await api.get('/api/notes');

  const contents = response.body.map(r => r.content);

  assert.strictEqual(response.body.length, initNotes.length+1);
  assert(contents.includes('Async/Await adding note'));
});

test.only('No Content - Not saved', async () => {
  const newNote = {
    important: true
  };

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(400);

  const response = await api.get('/api/notes');

  assert.strictEqual(response.body.length, initNotes.length);

});



after(async () => {
  await mongoose.connection.close();
});
