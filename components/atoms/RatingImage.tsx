"use client";

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

interface RatingImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string; // Optional: if you want to show a placeholder instead of just hiding
}

export function RatingImage({ src, alt, width, height, className, fallbackSrc, ...props }: RatingImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (fallbackSrc) {
      setImgSrc(fallbackSrc);
    } else {
      setHasError(true); // This will allow conditional rendering to hide the image
    }
  };

  if (hasError && !fallbackSrc) {
    return null; // Or some placeholder like <span className="text-xs">Image N/A</span>
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      {...props}
    />
  );
} 