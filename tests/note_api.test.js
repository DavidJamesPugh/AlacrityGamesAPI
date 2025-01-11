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

test.only('Notes as JSON', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

test.only('Two notes exists', async () => {
  const response = await api.get('/api/notes');

  assert.strictEqual(response.body.length, initNotes.length);
});

test('the first note is about HTTP methods', async () => {
  const response = await api.get('/api/notes');

  const contents = response.body.map((e) => e.content);
  assert(contents.includes('HTML is easy'));
});

after(async () => {
  await mongoose.connection.close();
});
