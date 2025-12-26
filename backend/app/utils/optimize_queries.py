"""
Performance Optimization Utilities
Database query optimization and connection pooling
"""

from sqlalchemy import event, create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.pool import QueuePool
import time
import logging

logger = logging.getLogger(__name__)

# Query performance tracking
query_times = []

@event.listens_for(Engine, "before_cursor_execute")
def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    """Track query start time"""
    conn.info.setdefault('query_start_time', []).append(time.time())

@event.list ens_for(Engine, "after_cursor_execute")
def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    """Track query execution time"""
    total_time = time.time() - conn.info['query_start_time'].pop(-1)
    query_times.append(total_time)
    
    # Log slow queries (> 1 second)
    if total_time > 1.0:
        logger.warning(f"Slow query ({total_time:.2f}s): {statement[:200]}")


def create_optimized_engine(database_url: str):
    """
    Create database engine with optimized connection pooling
    """
    return create_engine(
        database_url,
        poolclass=QueuePool,
        pool_size=10,  # Number of connections to maintain
        max_overflow=20,  # Max connections beyond pool_size
        pool_timeout=30,  # Timeout for getting connection from pool
        pool_recycle=3600,  # Recycle connections after 1 hour
        pool_pre_ping=True,  # Test connections before using
        echo=False  # Set to True for SQL logging
    )


def get_query_performance_stats():
    """
    Get query performance statistics
    """
    if not query_times:
        return {
            "total_queries": 0,
            "average_time": 0,
            "max_time": 0,
            "min_time": 0
        }
    
    return {
        "total_queries": len(query_times),
        "average_time": sum(query_times) / len(query_times),
        "max_time": max(query_times),
        "min_time": min(query_times),
        "slow_queries": len([t for t in query_times if t > 1.0])
    }


def reset_query_stats():
    """Reset query performance statistics"""
    global query_times
    query_times = []


# Database index suggestions
RECOMMENDED_INDEXES = {
    "orders": [
        "CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);",
        "CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);",
        "CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);",
    ],
    "rfqs": [
        "CREATE INDEX IF NOT EXISTS idx_rfqs_buyer_id ON rfqs(buyer_id);",
        "CREATE INDEX IF NOT EXISTS idx_rfqs_status ON rfqs(status);",
        "CREATE INDEX IF NOT EXISTS idx_rfqs_created_at ON rfqs(created_at DESC);",
    ],
    "quotes": [
        "CREATE INDEX IF NOT EXISTS idx_quotes_rfq_id ON quotes(rfq_id);",
        "CREATE INDEX IF NOT EXISTS idx_quotes_vendor_id ON quotes(vendor_id);",
        "CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);",
    ],
    "payments": [
        "CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);",
        "CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);",
        "CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);",
    ],
    "scraped_products": [
        "CREATE INDEX IF NOT EXISTS idx_products_sku ON scraped_products(sku);",
        "CREATE INDEX IF NOT EXISTS idx_products_name ON scraped_products(name);",
    ]
}


def apply_database_indexes(engine):
    """
    Apply recommended database indexes for performance
    """
    with engine.connect() as conn:
        for table, indexes in RECOMMENDED_INDEXES.items():
            for index_sql in indexes:
                try:
                    conn.execute(index_sql)
                    logger.info(f"Applied index: {index_sql}")
                except Exception as e:
                    logger.warning(f"Failed to apply index: {e}")
