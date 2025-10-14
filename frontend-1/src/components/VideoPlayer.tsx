import React from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  description: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, title, description }) => {
  const getEmbedUrl = (url: string): string => {
    if (!url) return '';
    
    // YouTube URL conversion
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Vimeo URL conversion
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    
    // Return original URL if it's already an embed URL or other format
    return url;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  if (!embedUrl) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <p className="text-gray-500">No video content available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Video Player */}
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={embedUrl}
          title={title}
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      
      {/* Course Description */}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
        <div className="prose max-w-none">
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;