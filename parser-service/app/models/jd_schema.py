from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class SalarySchema(BaseModel):
    min: Optional[int] = None
    max: Optional[int] = None
    raw_text: Optional[str] = None
    currency: str = "INR"
    period: str = "ANNUAL"
    formatted_label: Optional[str] = None

class JobHeader(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    work_mode: Optional[str] = None # "Remote", "Hybrid", "On-site"
    employment_type: Optional[str] = None # "Full-time", "Contract", "Part-time"
    salary: SalarySchema = Field(default_factory=SalarySchema)

class RequirementItem(BaseModel):
    text: str
    category: str = "Technical Skills" # "Technical Skills", "Experience", "Education", "Domain Knowledge", "Certifications"
    mandatory: bool = False
    weight: float = 1.0
    years_required: Optional[float] = None
    skills: List[str] = Field(default_factory=list)
    confidence: float = 1.0

class ParsedJDSchema(BaseModel):
    document_type: str = "JOB_DESCRIPTION"
    job: JobHeader = Field(default_factory=JobHeader)
    summary: Optional[str] = None
    requirements: List[RequirementItem] = Field(default_factory=list)
    responsibilities: List[str] = Field(default_factory=list)
    education_requirements: List[str] = Field(default_factory=list)
    experience_requirements: List[str] = Field(default_factory=list)
    location_requirements: List[str] = Field(default_factory=list)
    work_mode_requirements: List[str] = Field(default_factory=list)
    notice_period_requirements: List[str] = Field(default_factory=list)
    raw_sections: List[Dict[str, Any]] = Field(default_factory=list)
    confidence: Dict[str, float] = Field(default_factory=dict)
    warnings: List[str] = Field(default_factory=list)
