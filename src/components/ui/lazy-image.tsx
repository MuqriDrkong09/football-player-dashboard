import { cn } from '@/lib/utils'
import {
  useState,
  type ImgHTMLAttributes,
  type SyntheticEvent,
} from 'react'

type LazyImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'loading'> & {
  /** Use eager loading for above-the-fold LCP images. */
  priority?: boolean
  fallbackSrc?: string
}

export function LazyImage({
  src,
  alt,
  className,
  priority = false,
  fallbackSrc,
  onError,
  decoding = 'async',
  ...props
}: LazyImageProps) {
  const [failed, setFailed] = useState(false)

  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    if (fallbackSrc && event.currentTarget.src !== fallbackSrc) {
      event.currentTarget.src = fallbackSrc
      return
    }

    setFailed(true)
    onError?.(event)
  }

  if (failed || !src) {
    return (
      <span
        aria-hidden={alt ? undefined : true}
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
        className={cn('inline-block bg-muted', className)}
      />
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding={decoding}
      fetchPriority={priority ? 'high' : 'auto'}
      className={cn(className)}
      onError={handleError}
      {...props}
    />
  )
}
