import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ChatRoom = () => {
  const token = localStorage.getItem('token');
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [commentInputs, setCommentInputs] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [activePost, setActivePost] = useState(null);
  const postListRef = useRef(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  // Add new state for tags
  const [newTags, setNewTags] = useState('');
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  // Add search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchByTag, setSearchByTag] = useState(false);

  // Add animation states
  const [showNewPostForm, setShowNewPostForm] = useState(false);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      let url = 'http://localhost:5000/api/discussion/discussions';
      
      // If tags are selected, use the filter endpoint
      if (selectedTags.length > 0) {
        url = `http://localhost:5000/api/discussion/discussions/filter?tags=${selectedTags.join(',')}`;
      }
      
      const res = await axios.get(url, {
        headers: { 'Authorization': token }
      });
      setPosts(res.data);
      setError('');
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load discussions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/discussion/tags', {
        headers: { 'Authorization': token }
      });
      setAvailableTags(res.data);
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchTags();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchPosts, 30000);
    return () => clearInterval(interval);
  }, [token, selectedTags]); // Add selectedTags as dependency

  const handlePost = async () => {
    if (!newPost.trim() || !newTitle.trim()) return;
    
    // Process tags from comma-separated string to array
    const tagsArray = newTags.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/api/discussion/alumni/post', 
        { 
          title: newTitle, 
          content: newPost,
          tags: tagsArray 
        }, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setNewPost('');
      setNewTitle('');
      setNewTags('');
      await fetchPosts();
      await fetchTags(); // Refresh tags after posting
      setShowNewPostForm(false);
      // Scroll to the top of the post list
      postListRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('Error posting new discussion:', err);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentChange = (postId, value) => {
    setCommentInputs(prev => ({ ...prev, [postId]: value }));
  };

  const handleCommentSubmit = async (postId) => {
    const commentText = commentInputs[postId];
    if (!commentText?.trim()) return;
    
    try {
      await axios.post(`http://localhost:5000/api/discussion/discussions/${postId}/comment`, 
        { comment: commentText }, 
        { headers: { 'Authorization': `Bearer ${token}`} }
      );
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      await fetchPosts();
    } catch (err) {
      console.error('Error posting comment:', err);
      setError('Failed to post comment. Please try again.');
    }
  };

  const toggleComments = (postId) => {
    setActivePost(activePost === postId ? null : postId);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleTagSelect = (tag) => {
      setSelectedTags(prev => {
        if (prev.includes(tag)) {
          return prev.filter(t => t !== tag);
        } else {
          return [...prev, tag];
        }
      });
    };
  
  const filteredPosts = filter === 'all' 
    ? posts 
    : posts.filter(post => filter === 'withComments' 
        ? post.comments && post.comments.length > 0 
        : post.comments && post.comments.length === 0);

  // Apply search filtering
  const searchedPosts = searchQuery.trim() === '' 
    ? filteredPosts 
    : filteredPosts.filter(post => {
        if (searchByTag) {
          // Search by tags
          return post.tags && post.tags.some(tag => 
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          );
        } else {
          // Search by title and content
          return (
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
      });

  return (
    <div className="max-w-4xl mx-auto p-5 pt-24">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-lg shadow-lg mb-8 transform transition-all hover:scale-[1.01]">
        <h2 className="text-3xl font-bold">Common Room</h2>
        <p className="mt-2 text-blue-100">Share your thoughts, ask questions, and connect with others</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6 animate-pulse">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => setShowNewPostForm(!showNewPostForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full shadow-md transition-all duration-300 flex items-center"
        >
          {showNewPostForm ? (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              New Discussion
            </>
          )}
        </button>
        
        <div className="flex space-x-2">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white border border-gray-300 text-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Posts</option>
            <option value="withComments">With Comments</option>
            <option value="withoutComments">Without Comments</option>
          </select>
          
          <button 
            onClick={fetchPosts} 
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-md"
            title="Refresh"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </button>
        </div>
      </div>
      
      {/* Add search bar */}
      <div className="mb-6">
        <div className="flex items-center bg-white rounded-lg shadow-sm overflow-hidden">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchByTag ? "Search by tags..." : "Search discussions..."}
            className="flex-grow p-3 focus:outline-none"
          />
          <div className="border-l border-gray-200 px-3">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={searchByTag}
                onChange={() => setSearchByTag(!searchByTag)}
                className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-700">Search tags</span>
            </label>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-3 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Add tag filtering section */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Filter by Tags</h3>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <button
              key={tag.name}
              onClick={() => handleTagSelect(tag.name)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedTags.includes(tag.name)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tag.name} ({tag.count})
            </button>
          ))}
          {availableTags.length === 0 && (
            <p className="text-gray-500 text-sm">No tags available yet</p>
          )}
        </div>
        {selectedTags.length > 0 && (
          <div className="mt-2 flex items-center">
            <span className="text-sm text-gray-500 mr-2">Active filters:</span>
            <button
              onClick={() => setSelectedTags([])}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
      
      <div 
        className={`bg-white p-6 rounded-lg shadow-md mb-8 transition-all duration-300 overflow-hidden ${
          showNewPostForm ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 hidden'
        }`}
      >
        <h3 className="text-xl font-semibold mb-4">Create a New Post</h3>
        <input 
          type="text" 
          className="w-full p-3 border border-gray-300 rounded-md mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={newTitle} 
          onChange={(e) => setNewTitle(e.target.value)} 
          placeholder="Enter title..."
        />
        <textarea 
          className="w-full h-24 p-3 border border-gray-300 rounded-md mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={newPost} 
          onChange={(e) => setNewPost(e.target.value)} 
          placeholder="What's on your mind? Share your thoughts or questions..."
        />
        {/* Add tags input */}
        <input 
          type="text" 
          className="w-full p-3 border border-gray-300 rounded-md mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={newTags} 
          onChange={(e) => setNewTags(e.target.value)} 
          placeholder="Add tags (comma separated, e.g. career,technology,mentorship)"
        />
        <button 
          onClick={handlePost} 
          disabled={isLoading || !newTitle.trim() || !newPost.trim()}
          className={`mt-3 px-6 py-2 rounded-md text-white font-medium transition-all duration-200 ${
            isLoading || !newTitle.trim() || !newPost.trim() 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 transform hover:scale-105'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Posting...
            </span>
          ) : 'Post Discussion'}
        </button>
      </div>

      <div ref={postListRef}>
        <h3 className="text-2xl font-semibold mb-4">Recent Discussions</h3>
        
        {isLoading && posts.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : searchedPosts.length === 0 ? (
          <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
            <p className="text-gray-600">
              No discussions found. 
              {searchQuery ? ' Try a different search term.' : filter !== 'all' || selectedTags.length > 0 ? ' Try changing your filters.' : ' Be the first to start a conversation!'}
            </p>
          </div>
        ) : (
          <ul className="space-y-6">
            {searchedPosts.map((post, index) => (
              <li 
                key={post._id} 
                className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md transform hover:-translate-y-1"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-5">
                  <h4 className="text-xl font-semibold text-gray-800">{post.title}</h4>
                  <p className="mt-2 text-gray-700">{post.content}</p>
                  
                  {/* Display post tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {post.tags.map((tag, idx) => (
                        <span 
                          key={idx} 
                          className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <p className="text-gray-500">
                      Posted by <span className="font-medium">{post.author?.name || 'Unknown'}</span>
                      {post.createdAt && ` • ${formatDate(post.createdAt)}`}
                    </p>
                    <button 
                      onClick={() => toggleComments(post._id)}
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center transition-colors duration-200"
                    >
                      <span className="mr-1">{post.comments?.length || 0} Comments</span>
                      <svg className={`w-4 h-4 transition-transform duration-300 ${activePost === post._id ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                <div 
                  className={`bg-gray-50 border-t border-gray-200 transition-all duration-300 overflow-hidden ${
                    activePost === post._id ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-5">
                    <h5 className="font-medium text-gray-700 mb-3">Comments</h5>
                    {post.comments && post.comments.length > 0 ? (
                      <ul className="space-y-3 mb-4">
                        {post.comments.map((comment, index) => (
                          <li key={index} className="bg-white p-3 rounded-md shadow-sm border-l-4 border-blue-400">
                            <p className="text-gray-700">{comment.comment}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {comment.user?.name || 'Anonymous'} • {comment.createdAt && formatDate(comment.createdAt)}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 mb-4">No comments yet. Be the first to comment!</p>
                    )}
                    
                    <div className="flex">
                      <textarea 
                        className="flex-grow p-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={commentInputs[post._id] || ''}
                        onChange={(e) => handleCommentChange(post._id, e.target.value)}
                        placeholder="Add your comment..."
                      />
                      <button 
                        onClick={() => handleCommentSubmit(post._id)}
                        disabled={!commentInputs[post._id]?.trim()}
                        className={`px-4 rounded-r-md transition-colors duration-200 ${
                          !commentInputs[post._id]?.trim() 
                            ? 'bg-gray-300 text-gray-500' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChatRoom;
