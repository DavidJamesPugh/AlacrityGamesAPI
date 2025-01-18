// eslint-disable-next-line import/no-nodejs-modules
import {
  test, after, beforeEach, describe,
} from 'node:test';
import mongoose from 'mongoose';
import supertest from 'supertest';
// eslint-disable-next-line import/no-nodejs-modules
import assert from 'assert';
import { BlogHelper } from './blog_test_helper.js';
import app from '../app.js';
import Blog from '../models/blog.js';

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});

  await Promise.all(
    BlogHelper.blogs.map(async (blog) => {
      const blogObject = new Blog(blog);
      await blogObject.save();
    }),
  );
});

test('Getting Blogs as JSON', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

test('Correct amount of Blog posts', async () => {
  const blog = BlogHelper.blogs;
  const response = await api.get('/api/blogs');

  assert.equal(response.body.length, blog.length);
});

test('Id field exists', async () => {
  const response = await api.get('/api/blogs');

  assert(Array.isArray(response.body), 'Response body should be an array');

  // Check that each blog in the array has an 'id' field
  response.body.forEach((blog) => {
    assert(blog.id, `Blog entry is missing 'id' field: ${JSON.stringify(blog)}`);
  });
});

test('Blog Post - Creating', async () => {
  const newBlog = {
    title: 'Dark Arts at Heart',
    author: 'S. Snape',
    url: 'www.hogwarts.com',
    likes: 10,
  };

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const addedBlog = response.body;

  assert.strictEqual(addedBlog.title, newBlog.title);
  assert.strictEqual(addedBlog.author, newBlog.author);
  assert.strictEqual(addedBlog.url, newBlog.url);
  assert.strictEqual(addedBlog.likes, newBlog.likes);

  const endBlogs = await BlogHelper.blogsInDB();

  assert.strictEqual(endBlogs.length, BlogHelper.blogs.length + 1);

  const contents = endBlogs.map((blog) => blog.title);
  assert(contents.includes('Dark Arts at Heart'));
});

test('Blog Post - Create, Absent Likes', async () => {
  const newBlog = {
    title: 'Becoming an allegory for jesus',
    author: 'Aslan',
    url: 'www.narnia.gov',
  };

  const response = await api
    .post('/api/blogs/')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const addedBlog = response.body;

  assert.strictEqual(addedBlog.likes, 0);
});

test('Blog Post - Creating bad post', async () => {
  const newBlogBlankTitle = {
    title: 'Test',
    author: 'S. Snape',
    likes: 10,
  };
  const newBlogBlankauthor = {
    url: 'google.com',
    likes: 10,
  };
  await api
    .post('/api/blogs')
    .send(newBlogBlankTitle)
    .expect(400)
    .expect('Content-Type', /application\/json/);

  await api
    .post('/api/blogs')
    .send(newBlogBlankauthor)
    .expect(400)
    .expect('Content-Type', /application\/json/);
});

test.only('Updating blog', async () => {
  const blogsAtStart = await BlogHelper.blogsInDB();
  const blogToUpdate = blogsAtStart[0];

  const newBlog = {
    title: 'Dark Arts at Heart',
    author: 'S. Snape',
    url: 'www.hogwarts.com',
    likes: blogToUpdate.likes + 1,
  };

  const response = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  const updatedBlog = response.body;

  assert.strictEqual(blogToUpdate.likes + 1, newBlog.likes);
  assert.strictEqual(updatedBlog.content, newBlog.content);
  assert.strictEqual(updatedBlog.important, newBlog.important);

  // Ensure the ID remains the same
  assert.strictEqual(updatedBlog.id, blogToUpdate.id);

  // Verify the database state
  const blogsAtEnd = await BlogHelper.blogsInDB();
  assert.strictEqual(blogsAtEnd.length, blogsAtStart.length);

  const contents = blogsAtEnd.map((n) => n.title);
  assert(contents.includes(newBlog.title));
  assert(!contents.includes(blogToUpdate.title));
});

test('Deleting blog post', async () => {
  const blogs = await BlogHelper.blogsInDB();
  const blogToDelete = blogs[0];

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204);

  const blogAtEnd = await BlogHelper.blogsInDB();

  assert.strictEqual(blogAtEnd.length, blogs.length - 1);

  const contents = blogAtEnd.map((b) => b.title);
  assert(!contents.includes(blogToDelete.title));
});

after(async () => {
  await mongoose.connection.close();
});
