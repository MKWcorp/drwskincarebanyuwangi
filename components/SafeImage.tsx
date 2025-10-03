'use client';

import Image from 'next/image';
import { useState } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackSrc?: string;
  onError?: () => void;
  onClick?: () => void;
  priority?: boolean;
}

export default function SafeImage({
  src,
  alt,
  width,
  height,
  className = '',
  fallbackSrc = '/logo_drwskincare_square.png',
  onError,
  onClick,
  priority = false
}: SafeImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
    if (onError) {
      onError();
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // If image failed to load or src is empty/invalid, show fallback
  if (imageError || !src || src === 'null' || src === 'undefined') {
    return (
      <div 
        className={`bg-gray-200 rounded-lg flex items-center justify-center ${className}`}
        style={{ width, height }}
        onClick={onClick}
      >
        <div className="text-center text-gray-500">
          <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xs">Foto tidak tersedia</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" onClick={onClick}>
      {isLoading && (
        <div 
          className={`absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center ${className}`}
          style={{ width, height }}
        >
          <div className="text-gray-400">
            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        priority={priority}
        unoptimized={src.includes('drwgroup.id')} // Use unoptimized for problematic domains
      />
    </div>
  );
}