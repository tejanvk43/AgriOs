import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, Share2, Image as ImageIcon, Send } from 'lucide-react';

const Community = () => {
    const [posts, setPosts] = useState([
        {
            id: 1,
            author: 'Ramesh Kumar',
            role: 'Expert Farmer',
            content: 'My tomato yield increased by 20% after using drip irrigation. Highly recommended for dry regions!',
            likes: 24,
            comments: 5,
            time: '2 hours ago',
            image: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=500&q=80'
        },
        {
            id: 2,
            author: 'Suresh Reddy',
            role: 'Beginner',
            content: 'Facing pest issues in cotton crop. Any organic solutions?',
            likes: 8,
            comments: 12,
            time: '5 hours ago',
            image: null
        }
    ]);

    return (
        <div className="max-w-2xl mx-auto pb-20 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Community Hub</h2>

            {/* Create Post */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-600">
                        Me
                    </div>
                    <div className="flex-1">
                        <textarea
                            placeholder="Share your farming experience or ask a question..."
                            className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white resize-none"
                            rows="3"
                        ></textarea>
                        <div className="flex justify-between items-center mt-3">
                            <button className="text-gray-500 hover:text-green-600 transition">
                                <ImageIcon size={20} />
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium">
                                <Send size={16} /> Post
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feed */}
            <div className="space-y-6">
                {posts.map((post) => (
                    <div key={post.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                                {post.author.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">{post.author}</h4>
                                <p className="text-xs text-gray-500">{post.role} • {post.time}</p>
                            </div>
                        </div>

                        <p className="text-gray-800 dark:text-gray-200 mb-3 leading-relaxed">{post.content}</p>

                        {post.image && (
                            <img src={post.image} alt="Post attachment" className="rounded-xl w-full h-64 object-cover mb-4" />
                        )}

                        <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700 text-gray-500 dark:text-gray-400">
                            <button className="flex items-center gap-2 hover:text-green-600 transition">
                                <ThumbsUp size={18} /> <span>{post.likes} Likes</span>
                            </button>
                            <button className="flex items-center gap-2 hover:text-blue-600 transition">
                                <MessageSquare size={18} /> <span>{post.comments} Comments</span>
                            </button>
                            <button className="flex items-center gap-2 hover:text-gray-800 dark:hover:text-white transition">
                                <Share2 size={18} /> <span>Share</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Community;
