package org.mozilla.webmaker.storage;

import android.util.LruCache;

public class MemStorage {

    private static int cacheSize = 24 * 1024 * 2014;    // 24mb (100 images at current transcoding settings)
    private static final Cache cache = new Cache(cacheSize);

    /**
     * A globally accessible instance of this cache, that can be accessed anywhere.
     */
    //public static Cache sharedStorage() {
    //    return cache;
    //}

    /**
     * The actual cache class that is being wrapped around and provided with the maxSize.
     */
    public static class Cache extends LruCache<String, String> {
        /**
         * @param maxSize for caches that do not override {@link #sizeOf}, this is
         * the maximum number of entries in the cache. For all other caches,
         * this is the maximum sum of the sizes of the entries in this cache.
         */
        public Cache(int maxSize) {
            super(maxSize);
        }
    }
}
