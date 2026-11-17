import { useState } from 'react';
export function ImageWithFallback({ src, alt, className = '', priority = false, ...props }) {
  const [state, setState] = useState('loading');
  return (
    <span className={`image-shell ${className}`} data-state={state}>
      {state === 'error' ? (
        <span className="image-fallback">
          OneSip<span>Ảnh đang được cập nhật</span>
        </span>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
          width="800"
          height="800"
          {...props}
        />
      )}
    </span>
  );
}
