from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum

class DocumentType(str, Enum):
    CV = "CV"
    JOB_DESCRIPTION = "JOB_DESCRIPTION"
    UNKNOWN = "UNKNOWN"

class BlockType(str, Enum):
    HEADING = "heading"
    PARAGRAPH = "paragraph"
    LIST_ITEM = "list_item"
    TABLE = "table"
    KEY_VALUE = "key_value"
    HEADER = "header"
    FOOTER = "footer"

class DocumentBlock(BaseModel):
    page: int = 1
    section: Optional[str] = None
    type: BlockType = BlockType.PARAGRAPH
    text: str
    confidence: float = 1.0
    bounding_box: Optional[List[float]] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class StructuredDocument(BaseModel):
    file_name: str
    file_type: str
    page_count: int = 1
    character_count: int = 0
    word_count: int = 0
    document_type: DocumentType = DocumentType.UNKNOWN
    parser_engine: str = "docling"
    ocr_used: bool = False
    blocks: List[DocumentBlock] = Field(default_factory=list)
    raw_text: str = ""
    layout_text: str = ""
    sections: Dict[str, List[str]] = Field(default_factory=dict)
    tables: List[Dict[str, Any]] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
