import { test, after, beforeEach } from 'node:test';
import mongoose from 'mongoose';
import supertest from 'supertest';
import assert from 'assert';
import { Helper } from './test_helper.js';
import app from '../app.js';
import Note from '../models/note.js';

const api = supertest(app);


beforeEach(async () => {
  await Note.deleteMany({});
  console.log('Cleared');

  for (const note of Helper.initNotes) {
    let noteObject = new Note(note);
    await noteObject.save();
    console.log('Saved Mock DB');
  }
  console.log('Done');
});

test.only('Notes as JSON', async () => {
  console.log('Test');
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

test('Two notes exists', async () => {
  const response = await api.get('/api/notes');

  assert.strictEqual(response.body.length, Helper.initNotes.length);
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

  const notesAtEnd = await Helper.notesInDB();
  assert.strictEqual(notesAtEnd.length, Helper.initNotes.length + 1);

  const contents = notesAtEnd.map((r) => r.content);
  assert(contents.includes('Async/Await adding note'));
});

test('No Content - Not saved', async () => {
  const newNote = {
    important: true,
  };

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(400);

  const notesAtEnd = await Helper.notesInDB();

  assert.strictEqual(notesAtEnd.length, Helper.initNotes.length);
});

test.only('Specific Note - View', async () => {
  const notesAtStart = await Helper.notesInDB();

  const noteToView = notesAtStart[0];

  const resultNote = await api
    .get(`/api/notes/${noteToView.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.deepStrictEqual(resultNote.body, noteToView);
});

test.only('Specific Note - Delete', async () => {
  const notesAtStart = await Helper.notesInDB();

  const noteToDelete = notesAtStart[0];

  await api
    .delete(`/api/notes/${noteToDelete.id}`)
    .expect(204);

  const notesAtEnd = await Helper.notesInDB();

  const contents = notesAtEnd.map((r) => r.content);
  assert(!contents.includes(noteToDelete.content));

  assert.strictEqual(notesAtEnd.length, Helper.initNotes.length - 1);
});

test.only('Updated Note', async () => {
  const notesAtStart = await Helper.notesInDB();
  const noteToUpdate = notesAtStart[0];

  const note = {
    content: 'New updated note',
    important: true,
  };
  const response = await api
    .put(`/api/notes/${noteToUpdate.id}`)
    .send(note)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const updatedNote = response.body;


  assert.strictEqual(updatedNote.content, note.content);
  assert.strictEqual(updatedNote.important, note.important);

  // Ensure the ID remains the same
  assert.strictEqual(updatedNote.id, noteToUpdate.id);

  // Verify the database state
  const notesAtEnd = await Helper.notesInDB();
  assert.strictEqual(notesAtEnd.length, notesAtStart.length);

  const contents = notesAtEnd.map((n) => n.content);
  assert(contents.includes(note.content));
  assert(!contents.includes(noteToUpdate.content));
});


after(async () => {
  await mongoose.connection.close();
});
