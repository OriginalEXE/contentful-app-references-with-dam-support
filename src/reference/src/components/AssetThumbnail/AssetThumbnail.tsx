import React from 'react';

interface AssetThumbnailProps {
  alt: string;
  url: string;
  width?: number;
  height?: number;
}

export function AssetThumbnail(props: AssetThumbnailProps) {
  return (
    <img
      alt={props.alt}
      src={props.url}
      height={props.height}
      width={props.width}
      style={{ objectFit: 'cover' }}
    />
  );
}
