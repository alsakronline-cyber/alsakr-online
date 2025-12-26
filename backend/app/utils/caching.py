"""
Redis Caching Layer
Implements caching for frequently accessed data
"""

import redis
import json
import os
from typing import Any, Optional
from functools import wraps
import logging

logger = logging.getLogger(__name__)

# Redis connection
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_DB = int(os.getenv("REDIS_DB", 0))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)

# Initialize Redis client
redis_client = redis.Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    db=REDIS_DB,
    password=REDIS_PASSWORD,
    decode_responses=True
)


def cache_key_builder(*args, prefix="cache", **kwargs):
    """Build cache key from arguments"""
    key_parts = [prefix]
    key_parts.extend([str(arg) for arg in args])
    key_parts.extend([f"{k}:{v}" for k, v in sorted(kwargs.items())])
    return ":".join(key_parts)


def cache_get(key: str) -> Optional[Any]:
    """
    Get value from cache
    """
    try:
        value = redis_client.get(key)
        if value:
            return json.loads(value)
        return None
    except Exception as e:
        logger.error(f"Cache get error: {e}")
        return None


def cache_set(key: str, value: Any, ttl: int = 300):
    """
    Set value in cache with TTL (default 5 minutes)
    """
    try:
        redis_client.setex(key, ttl, json.dumps(value))
        return True
    except Exception as e:
        logger.error(f"Cache set error: {e}")
        return False


def cache_delete(key: str):
    """
    Delete key from cache
    """
    try:
        redis_client.delete(key)
        return True
    except Exception as e:
        logger.error(f"Cache delete error: {e}")
        return False


def cache_delete_pattern(pattern: str):
    """
    Delete all keys matching pattern
    Example: cache_delete_pattern("product:*")
    """
    try:
        keys = redis_client.keys(pattern)
        if keys:
            redis_client.delete(*keys)
        return True
    except Exception as e:
        logger.error(f"Cache delete pattern error: {e}")
        return False


def cached(ttl: int = 300, prefix: str = "cache"):
    """
    Decorator to cache function results
    Usage:
        @cached(ttl=600, prefix="products")
        def get_product(product_id):
            return db.query(...).first()
    """
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            # Build cache key
            cache_key = cache_key_builder(*args, prefix=f"{prefix}:{func.__name__}", **kwargs)
            
            # Try to get from cache
            cached_value = cache_get(cache_key)
            if cached_value is not None:
                logger.debug(f"Cache hit: {cache_key}")
                return cached_value
            
            # Call function if not cached
            result = await func(*args, **kwargs)
            
            # Store in cache
            if result is not None:
                cache_set(cache_key, result, ttl)
                logger.debug(f"Cache set: {cache_key}")
            
            return result
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            cache_key = cache_key_builder(*args, prefix=f"{prefix}:{func.__name__}", **kwargs)
            
            cached_value = cache_get(cache_key)
            if cached_value is not None:
                logger.debug(f"Cache hit: {cache_key}")
                return cached_value
            
            result = func(*args, **kwargs)
            
            if result is not None:
                cache_set(cache_key, result, ttl)
                logger.debug(f"Cache set: {cache_key}")
            
            return result
        
        # Return appropriate wrapper based on function type
        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper
    
    return decorator


# Cache invalidation helpers
class CacheInvalidator:
    """Helper class for cache invalidation"""
    
    @staticmethod
    def invalidate_product(product_id: str):
        """Invalidate product caches"""
        cache_delete_pattern(f"product:*:{product_id}*")
        cache_delete_pattern(f"search:*")  # Invalidate search results
    
    @staticmethod
    def invalidate_order(order_id: str):
        """Invalidate order caches"""
        cache_delete_pattern(f"order:*:{order_id}*")
    
    @staticmethod
    def invalidate_rfq(rfq_id: str):
        """Invalidate RFQ caches"""
        cache_delete_pattern(f"rfq:*:{rfq_id}*")
        cache_delete_pattern(f"vendor:*:rfqs*")  # Invalidate vendor RFQ lists
    
    @staticmethod
    def invalidate_user(user_id: str):
        """Invalidate user-related caches"""
        cache_delete_pattern(f"user:*:{user_id}*")
        cache_delete_pattern(f"buyer:*:{user_id}*")
        cache_delete_pattern(f"vendor:*:{user_id}*")


# Example usage in API routes:
# @cached(ttl=600, prefix="products")
# async def get_product_by_id(product_id: str):
#     return db.query(Product).filter(Product.id == product_id).first()
