import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { config } from '../config';

const VideoLessons = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const response = await fetch(`${config.API_BASE_URL}/api/video-lessons`);
            const data = await response.json();
            setVideos(data);
        } catch (error) {
            console.error('Error fetching video lessons:', error);
        } finally {
            setLoading(false);
        }
    };

    const getEmbedUrl = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
    };

    const filteredVideos = selectedCategory === 'All'
        ? videos
        : videos.filter(video => video.category === selectedCategory);

    const categories = ['All', 'Science', 'Arts', 'Commercial', 'General'];

    return (
        <div className="pt-24 pb-16 min-h-screen bg-gray-50">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Video Lessons</h1>
                    <p className="text-lg text-gray-600">Watch recorded lessons and tutorials</p>
                </motion.div>

                {/* Category Filter */}
                <div className="flex justify-center gap-4 mb-12 flex-wrap">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-6 py-2 rounded-full transition-all ${selectedCategory === category
                                    ? 'bg-primary-600 text-white shadow-lg'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 hover:shadow'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredVideos.map((video, index) => {
                            const embedUrl = getEmbedUrl(video.youtubeUrl);
                            return (
                                <motion.div
                                    key={video._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                                >
                                    <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                                        {embedUrl ? (
                                            <iframe
                                                src={embedUrl}
                                                title={video.title}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="w-full h-full"
                                            ></iframe>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-500">
                                                Invalid Video URL
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6">
                                        <span className="inline-block px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-sm font-medium mb-3">
                                            {video.category || 'General'}
                                        </span>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{video.title}</h3>
                                        <p className="text-gray-600 mb-4 line-clamp-3">{video.description}</p>
                                        <div className="text-sm text-gray-400">
                                            Uploaded on {new Date(video.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {!loading && filteredVideos.length === 0 && (
                    <div className="text-center text-gray-500 py-12">
                        No video lessons found in this category.
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoLessons;
