import mongoose from 'mongoose';

const blogsTable = mongoose.connection.useDb('blogsApp');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  url: { type: String, required: true },
  likes: { type: Number },
});

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    // eslint-disable-next-line no-underscore-dangle,no-param-reassign
    returnedObject.id = returnedObject._id.toString();
    // eslint-disable-next-line no-param-reassign,no-underscore-dangle
    delete returnedObject._id;
    // eslint-disable-next-line no-param-reassign,no-underscore-dangle
    delete returnedObject.__v;
  },
});

const Blog = blogsTable.model('blogsApp', blogSchema);

export default Blog;
