import React, { useState } from 'react';
import { PlayCircle, BookOpen, Filter } from 'lucide-react';

const Training = () => {
    const [activeTab, setActiveTab] = useState('videos');

    const videos = [
        { id: 1, title: 'Modern Drip Irrigation Techniques', duration: '15:20', thumbnail: 'https://images.unsplash.com/photo-1615811361269-669f43c3543b?auto=format&fit=crop&w=500&q=80', views: '1.2k' },
        { id: 2, title: 'Organic Pest Control Methods', duration: '10:45', thumbnail: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=500&q=80', views: '850' },
    ];

    const articles = [
        { id: 1, title: 'Guide to Soil Health Management', readTime: '5 min read', category: 'Soil Health' },
        { id: 2, title: 'Understanding Crop Insurance Policies', readTime: '8 min read', category: 'Finance' },
    ];

    return (
        <div className="max-w-3xl mx-auto pb-20 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Training Resources</h2>

            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <button
                    onClick={() => setActiveTab('videos')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'videos' ? 'bg-white dark:bg-gray-700 shadow-sm text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}
                >
                    Video Tutorials
                </button>
                <button
                    onClick={() => setActiveTab('articles')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'articles' ? 'bg-white dark:bg-gray-700 shadow-sm text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}
                >
                    Articles & Guides
                </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
                {activeTab === 'videos' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {videos.map((video) => (
                            <div key={video.id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 group cursor-pointer">
                                <div className="relative">
                                    <img src={video.thumbnail} alt={video.title} className="w-full h-48 object-cover" />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                        <PlayCircle size={48} className="text-white" />
                                    </div>
                                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">{video.duration}</span>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">{video.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{video.views} views</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {articles.map((article) => (
                            <div key={article.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                    <BookOpen size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">{article.title}</h3>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md">{article.category}</span>
                                        <span>{article.readTime}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Training;
