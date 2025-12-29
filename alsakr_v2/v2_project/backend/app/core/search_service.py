"""
Search Service Layer
Unified search interface for Elasticsearch and Qdrant
"""
from typing import List, Dict, Optional
from elasticsearch import Elasticsearch
from qdrant_client import QdrantClient
import requests

from .config import settings, get_es_url, get_qdrant_url


class SearchService:
    """Unified search service for products"""
    
    def __init__(self):
        self.es = Elasticsearch([get_es_url()])
        self.qdrant = QdrantClient(url=get_qdrant_url())
        self.ollama_url = settings.OLLAMA_HOST
    
    def text_search(self, query: str, size: int = 10, filters: Optional[Dict] = None) -> List[Dict]:
        """
        Full-text search in Elasticsearch
        
        Args:
            query: Search query string
            size: Number of results
            filters: Optional filters (category, phased_out, etc.)
            
        Returns:
            List of product documents
        """
        # Build query - use should clauses for better part number matching
        should_clauses = [
            # Exact part number match (highest priority)
            {
                "term": {
                    "part_number": {
                        "value": query,
                        "boost": 10.0
                    }
                }
            },
            # Case-insensitive part number match
            {
                "match": {
                    "part_number": {
                        "query": query,
                        "boost": 5.0
                    }
                }
            },
            # Multi-field search for other fields
            {
                "multi_match": {
                    "query": query,
                    "fields": ["name^3", "description^2", "category"],
                    "type": "best_fields",
                    "fuzziness": "AUTO"
                }
            }
        ]
        
        # Add filters
        filter_clauses = []
        if filters:
            if 'category' in filters:
                filter_clauses.append({"term": {"category.keyword": filters['category']}})
            if 'phased_out' in filters:
                filter_clauses.append({"term": {"phased_out": filters['phased_out']}})
        
        # Build ES query
        es_query = {
            "query": {
                "bool": {
                    "should": should_clauses,
                    "filter": filter_clauses,
                    "minimum_should_match": 1
                }
            },
            "size": size,
            "highlight": {
                "fields": {
                    "name": {},
                    "description": {}
                }
            }
        }
        
        # Execute search
        try:
            result = self.es.search(
                index=settings.ES_PRODUCTS_INDEX,
                body=es_query
            )
            
            # Format results
            products = []
            for hit in result['hits']['hits']:
                product = hit['_source']
                product['_score'] = hit['_score']
                product['_highlights'] = hit.get('highlight', {})
                products.append(product)
            
            return products
            
        except Exception as e:
            print(f"Elasticsearch search error: {e}")
            return []
    
    def semantic_search(self, query: str, limit: int = 10) -> List[Dict]:
        """
        Vector similarity search in Qdrant
        
        Args:
            query: Natural language query
            limit: Number of results
            
        Returns:
            List of similar products
        """
        try:
            # Generate query embedding
            response = requests.post(
                f"{self.ollama_url}/api/embeddings",
                json={
                    "model": settings.OLLAMA_EMBEDDING_MODEL,
                    "prompt": query
                },
                timeout=30
            )
            
            if response.status_code != 200:
                return []
            
            query_vector = response.json()['embedding']
            
            # Search Qdrant
            results = self.qdrant.search(
                collection_name=settings.QDRANT_PRODUCTS_COLLECTION,
                query_vector=query_vector,
                limit=limit
            )
            
            # Format results
            products = []
            for result in results:
                product = result.payload
                product['_score'] = result.score
                products.append(product)
            
            return products
            
        except Exception as e:
            print(f"Qdrant search error: {e}")
            return []
    
    def hybrid_search(self, query: str, size: int = 10) -> List[Dict]:
        """
        Combine text and semantic search for best results
        
        Args:
            query: Search query
            size: Number of results
            
        Returns:
            Merged and ranked results
        """
        # Get results from both
        text_results = self.text_search(query, size=size)
        semantic_results = self.semantic_search(query, limit=size)
        
        # Merge by part_number
        merged = {}
        
        # Add text results
        for product in text_results:
            part_no = product.get('part_number')
            if part_no:
                merged[part_no] = product
                merged[part_no]['text_score'] = product.get('_score', 0)
        
        # Add semantic results
        for product in semantic_results:
            part_no = product.get('part_number')
            if part_no:
                if part_no in merged:
                    # Boost if in both
                    merged[part_no]['semantic_score'] = product.get('_score', 0)
                    merged[part_no]['combined_score'] = (
                        merged[part_no]['text_score'] * 0.6 +
                        product.get('_score', 0) * 0.4
                    )
                else:
                    merged[part_no] = product
                    merged[part_no]['semantic_score'] = product.get('_score', 0)
                    merged[part_no]['combined_score'] = product.get('_score', 0) * 0.4
        
        # Sort by combined score
        results = sorted(
            merged.values(),
            key=lambda x: x.get('combined_score', 0),
            reverse=True
        )
        
        return results[:size]
    
    def get_product(self, part_number: str) -> Optional[Dict]:
        """Get single product by part number"""
        try:
            result = self.es.get(
                index=settings.ES_PRODUCTS_INDEX,
                id=part_number
            )
            return result['_source']
        except:
            return None
    
    def get_similar_products(self, part_number: str, limit: int = 5) -> List[Dict]:
        """Find similar products based on a given product"""
        # Get the product
        product = self.get_product(part_number)
        if not product:
            return []
        
        # Use its description for semantic search
        query = f"{product.get('name')} {product.get('description', '')}"
        results = self.semantic_search(query, limit=limit + 1)
        
        # Remove the original product
        return [r for r in results if r.get('part_number') != part_number][:limit]
    
    def get_categories(self) -> List[str]:
        """Get all unique product categories"""
        try:
            result = self.es.search(
                index=settings.ES_PRODUCTS_INDEX,
                body={
                    "size": 0,
                    "aggs": {
                        "categories": {
                            "terms": {
                                "field": "category.keyword",
                                "size": 100
                            }
                        }
                    }
                }
            )
            
            buckets = result['aggregations']['categories']['buckets']
            return [b['key'] for b in buckets]
            
        except:
            return []
