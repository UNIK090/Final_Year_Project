import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Youtube, BookOpen, Loader2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Resources = () => {
  const [videos, setVideos] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState({ videos: false, articles: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDisease, setSelectedDisease] = useState('diabetes');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchVideos = async (query, disease) => {
    setLoading((prev) => ({ ...prev, videos: true }));
    try {
      const response = await axios.get(`${API}/videos/search`, {
        params: {
          query: query || 'health wellness',
          disease: disease,
          max_results: 6,
        },
      });
      setVideos(response.data);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading((prev) => ({ ...prev, videos: false }));
    }
  };

  const fetchArticles = async (disease = null) => {
    setLoading((prev) => ({ ...prev, articles: true }));
    try {
      const response = await axios.get(`${API}/articles`, {
        params: disease ? { disease } : {},
      });
      setArticles(response.data);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading((prev) => ({ ...prev, articles: false }));
    }
  };

  const handleVideoSearch = () => {
    if (searchQuery.trim()) {
      fetchVideos(searchQuery, selectedDisease);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-primary-900 mb-4" data-testid="resources-title">
            Health Resources
          </h1>
          <p className="font-sans text-base text-slate-600">Expert videos and educational articles about health and wellness</p>
        </div>

        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="videos" data-testid="tab-videos" className="space-x-2">
              <Youtube className="h-4 w-4" />
              <span>Videos</span>
            </TabsTrigger>
            <TabsTrigger value="articles" data-testid="tab-articles" className="space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Articles</span>
            </TabsTrigger>
          </TabsList>

          {/* Videos Tab */}
          <TabsContent value="videos">
            {/* Search Bar */}
            <Card className="bg-white rounded-2xl border border-slate-100 shadow-soft mb-8">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <Input
                    type="text"
                    placeholder="Search for health videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleVideoSearch()}
                    data-testid="input-video-search"
                    className="flex-1 bg-white border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 rounded-xl"
                  />
                  <select
                    value={selectedDisease}
                    onChange={(e) => setSelectedDisease(e.target.value)}
                    data-testid="select-disease"
                    className="px-4 py-2 border border-slate-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  >
                    <option value="diabetes">Diabetes</option>
                    <option value="heart">Heart Disease</option>
                    <option value="parkinson">Parkinson's</option>
                    <option value="general">General Health</option>
                  </select>
                  <Button
                    onClick={handleVideoSearch}
                    disabled={loading.videos}
                    data-testid="btn-search-videos"
                    className="bg-primary-600 text-white hover:bg-primary-700 rounded-xl px-6"
                  >
                    {loading.videos ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Videos Grid */}
            {loading.videos ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
              </div>
            ) : videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video, index) => (
                  <Card
                    key={index}
                    className="bg-white rounded-2xl border border-slate-100 shadow-soft hover:shadow-hover transition-all duration-300 overflow-hidden"
                    data-testid={`video-card-${index}`}
                  >
                    <a
                      href={`https://www.youtube.com/watch?v=${video.video_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-48 object-cover"
                      />
                    </a>
                    <CardContent className="p-4">
                      <h3 className="font-heading font-semibold text-lg text-primary-900 mb-2 line-clamp-2">
                        {video.title}
                      </h3>
                      <p className="font-sans text-sm text-slate-600 mb-2">{video.channel_title}</p>
                      <p className="font-sans text-xs text-slate-500 line-clamp-2">{video.description}</p>
                      <a
                        href={`https://www.youtube.com/watch?v=${video.video_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 mt-4 text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        <span>Watch on YouTube</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white rounded-2xl border border-slate-100 shadow-soft">
                <CardContent className="p-12 text-center">
                  <Youtube className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="font-sans text-slate-600">Search for videos to get started</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Articles Tab */}
          <TabsContent value="articles">
            {loading.articles ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
              </div>
            ) : (
              <div className="space-y-6">
                {articles.map((article, index) => (
                  <Card
                    key={article.id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-soft hover:shadow-hover transition-all duration-300"
                    data-testid={`article-card-${index}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="font-heading text-2xl text-primary-900 mb-2">
                            {article.title}
                          </CardTitle>
                          <CardDescription className="font-sans">
                            <span className="inline-block px-3 py-1 bg-secondary-100 text-primary-700 rounded-full text-xs font-medium uppercase tracking-wider">
                              {article.category}
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="font-sans text-base text-slate-600 leading-relaxed">{article.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Image Section */}
        <div className="mt-12 rounded-3xl overflow-hidden shadow-hover">
          <img
            src="https://images.unsplash.com/photo-1761839257647-df30867afd54?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwxfHxzZW5pb3IlMjBjb3VwbGUlMjBoYXBweSUyMGFjdGl2ZSUyMG91dGRvb3JzfGVufDB8fHx8MTc2NjI1MjA4N3ww&ixlib=rb-4.1.0&q=85"
            alt="Happy senior couple outdoors"
            className="w-full h-64 object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Resources;