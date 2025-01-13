const dummy = (blogs) => 1;

const totalLikes = (blogs) => blogs.reduce((sum, blog) => sum + blog.likes, 0);

const favoriteBlog = (blogs) => blogs.reduce((prev, current) => (prev && prev.likes > current.likes ? prev : current));

const listHelper = { dummy, totalLikes, favoriteBlog };

export default listHelper;
