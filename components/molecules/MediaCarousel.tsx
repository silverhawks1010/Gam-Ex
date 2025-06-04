'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { BsPlayCircle, BsImage } from 'react-icons/bs';

interface Video {
  id: number;
  name?: string;
  video_id: string;
}

interface IGDBImage {
  id: number;
  image_id?: string;
  url: string;
  width?: number;
  height?: number;
  animated?: boolean;
  alpha_channel?: boolean;
  checksum?: string;
}

interface MediaItem {
  id: string;
  type: 'video' | 'screenshot';
  name?: string;
  originalId: number;
  video_id?: string;
  url?: string;
  thumbnailUrl: string;
}

interface MediaCarouselProps {
  videos: Video[];
  screenshots: IGDBImage[];
  gameName: string;
}

// Fonction utilitaire pour formater les URLs IGDB
const formatIGDBImageUrl = (url: string, size: 'thumb' | 'screenshot_med' | '1080p' = '1080p') => {
  if (!url) return '';
  const baseUrl = url.split('/t_')[0];
  const imageId = url.split('/').pop();
  return `${baseUrl}/t_${size}/${imageId}`;
};

export function MediaCarousel({ videos, screenshots, gameName }: MediaCarouselProps) {
  const mediaItems: MediaItem[] = useMemo(() => {
    const combined: MediaItem[] = [];
    
    // Ajout des vidéos
    videos.forEach(v => combined.push({
      id: `video-${v.id}`,
      type: 'video',
      name: v.name || `Vidéo ${v.video_id}`,
      originalId: v.id,
      video_id: v.video_id,
      thumbnailUrl: `https://img.youtube.com/vi/${v.video_id}/mqdefault.jpg`,
    }));

    // Ajout des screenshots
    screenshots.forEach(s => {
      if (s.url) {
        combined.push({
          id: `ss-${s.id}`,
          type: 'screenshot',
          name: `Screenshot ${s.id}`,
          originalId: s.id,
          url: formatIGDBImageUrl(s.url, '1080p'),
          thumbnailUrl: formatIGDBImageUrl(s.url, 'screenshot_med'),
        });
      }
    });

    return combined;
  }, [videos, screenshots]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  if (mediaItems.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground bg-muted rounded-lg">
        Aucun média disponible pour ce jeu.
      </div>
    );
  }

  const selectedMedia = mediaItems[selectedIndex];

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
  };

  const handleSelectThumbnail = (index: number) => {
    setSelectedIndex(index);
  };

  return (
    <div className="space-y-4">
      {/* Main Media Display */}
      <div className="relative">
        <AspectRatio ratio={16 / 9} className="bg-black rounded-lg overflow-hidden shadow-lg">
          {selectedMedia.type === 'video' && selectedMedia.video_id ? (
            <iframe
              src={`https://www.youtube.com/embed/${selectedMedia.video_id}?autoplay=0&rel=0`}
              title={selectedMedia.name || 'Vidéo du jeu'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          ) : selectedMedia.type === 'screenshot' && selectedMedia.url ? (
            <Image
              src={selectedMedia.url}
              alt={selectedMedia.name || `Screenshot de ${gameName}`}
              fill
              className="object-contain"
              priority={selectedIndex === 0}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <BsImage className="w-24 h-24 text-muted-foreground" />
            </div>
          )}
        </AspectRatio>
        {mediaItems.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/70 hover:bg-background/90 text-foreground rounded-full w-10 h-10 md:w-12 md:h-12"
              aria-label="Média précédent"
            >
              <IoChevronBack className="h-6 w-6 md:h-7 md:w-7" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/70 hover:bg-background/90 text-foreground rounded-full w-10 h-10 md:w-12 md:h-12"
              aria-label="Média suivant"
            >
              <IoChevronForward className="h-6 w-6 md:h-7 md:w-7" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {mediaItems.length > 1 && (
        <div className="relative">
          <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-thin scrollbar-thumb-primary/60 scrollbar-track-transparent -mx-1 px-1">
            {mediaItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleSelectThumbnail(index)}
                className={`relative shrink-0 w-28 h-16 md:w-36 md:h-20 rounded-md overflow-hidden border-2 transition-all
                            ${selectedIndex === index ? 'border-primary shadow-lg' : 'border-transparent hover:border-muted-foreground/50'}`}
                aria-label={`Voir ${item.type} ${item.name || item.originalId}`}
              >
                <Image
                  src={item.thumbnailUrl}
                  alt={`Miniature ${item.name || item.type + ' ' + item.originalId}`}
                  fill
                  className="object-cover"
                />
                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <BsPlayCircle className="w-6 h-6 text-white/90" />
                  </div>
                )}
                {selectedIndex === index && <div className="absolute inset-0 ring-2 ring-primary ring-inset rounded-md" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 