import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  threshold?: number;
  rootMargin?: string;
  debounceMs?: number;
}

export function useInfiniteScroll({
  hasMore,
  isLoading,
  isLoadingMore,
  onLoadMore,
  threshold = 0.1,
  rootMargin = '20px',
  debounceMs = 300,
}: UseInfiniteScrollOptions) {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedLoadMore = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      onLoadMore();
    }, debounceMs);
  }, [onLoadMore, debounceMs]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !isLoadingMore && !isLoading) {
        debouncedLoadMore();
      }
    },
    [hasMore, isLoadingMore, isLoading, debouncedLoadMore]
  );

  useEffect(() => {
    // Create observer only once
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(handleObserver, {
        root: null,
        rootMargin,
        threshold,
      });
    }

    const observer = observerRef.current;
    
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (observer) {
        observer.disconnect();
        observerRef.current = null;
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [handleObserver, rootMargin, threshold]);

  return { loadMoreRef };
}
