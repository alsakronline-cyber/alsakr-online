from pydantic import BaseModel
from typing import List, Optional

class SearchResult(BaseModel):
    part_id: str
    part_number: str
    manufacturer: str
    description: str
    score: float
    thumbnail_url: Optional[str] = None

class SearchResponse(BaseModel):
    results: List[SearchResult]
    query_time_ms: float
    total_found: int

class TextSearchRequest(BaseModel):
    query: str
    language: str = "en"
    filters: Optional[dict] = None
