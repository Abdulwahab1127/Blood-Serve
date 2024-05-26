
        function toggleBlog(id) {
            const blogPost = document.getElementById(id);
            if (blogPost.classList.contains('expanded')) {
                blogPost.classList.remove('expanded');
                blogPost.querySelector('.extend-btn').textContent = 'Extend';
            } else {
                const allBlogs = document.querySelectorAll('.blog-post');
                allBlogs.forEach(blog => blog.classList.remove('expanded'));
                blogPost.classList.add('expanded');
                blogPost.querySelector('.extend-btn').textContent = 'Exit';
            }
        }
