import express from 'express';
import Blog from '../models/blog.js';

const blogsRouter = express.Router();

blogsRouter.get('/', async (request, response) => {
  const blogResponse = await Blog.find({});
  response.status(200).json(blogResponse);
});

blogsRouter.post('/', async (request, response) => {
  const { body } = request;

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes ?? 0,
  });

  const savedBlog = await blog.save();

  response.status(201).json(savedBlog);
});

blogsRouter.put('/:id', async (request, response) => {
  const { body } = request;

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes ?? 0,
  };

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    blog,
    { new: true },
  );

  if (updatedBlog) {
    response.status(200).json(updatedBlog);
  } else {
    response.status(404).end();
  }
});

blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id);
  response.status(204).end();
});

export default blogsRouter;
