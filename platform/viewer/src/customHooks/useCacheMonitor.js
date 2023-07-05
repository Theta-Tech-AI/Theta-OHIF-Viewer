import { useEffect } from 'react';
import cornerstone from 'cornerstone-core';
import { setItem } from '../lib/localStorageUtils';

export const useCacheMonitor = () => {
  // convert GB to Bytes
  const MAX_CACHE_SIZE = 1 * 1024 * 1024 * 1024;

  useEffect(() => {
    // Set maximum cache size
    cornerstone.imageCache.setMaximumSizeBytes(MAX_CACHE_SIZE);

    const cacheMonitorInterval = setInterval(() => {
      // Get current cache information
      const cacheInfo = cornerstone.imageCache.getCacheInfo();
      setItem('purgeCache', cacheInfo.cacheSizeInBytes);

      // If the cache size exceeds maximum size, purge cache
      if (cacheInfo.cacheSizeInBytes > MAX_CACHE_SIZE) {
        cornerstone.imageCache.purgeCache();
        console.log('Cache purged!');
      }
    }, 1000); // checks every 5 seconds

    // Cleanup on unmount
    return () => clearInterval(cacheMonitorInterval);
  }, []);
};
