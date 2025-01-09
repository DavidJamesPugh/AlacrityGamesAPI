import express from 'express';
import Blog from '../models/blog.js';

const blogsRouter = express.Router();

blogsRouter.get('/', (request, response) => {
  Blog.find({}).then((blogs) => {
    response.json(blogs);
  });
});

blogsRouter.post('/', (request, response, next) => {
  const { body } = request;

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url ?? '',
    likes: 0,
  });

  blog.save().then((savedBlog) => {
    response.status(201).json(savedBlog);
  }).catch((error) => next(error));
});

export default blogsRouter;
