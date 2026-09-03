from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class FieldEvidence(BaseModel):
    field: str
    value: Any = None
    confidence: float = 1.0
    page: Optional[int] = 1
    section: Optional[str] = None
    evidence_text: Optional[str] = None
    status: str = "CONFIRMED" # "CONFIRMED", "NEEDS_REVIEW", "INFERRED"

class CandidateContact(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None

class SkillItem(BaseModel):
    skill: str
    category: Optional[str] = None
    evidence: Optional[str] = None
    confidence: float = 1.0
    page: Optional[int] = 1
    section: Optional[str] = None

class ExperienceItem(BaseModel):
    company: Optional[str] = None
    job_title: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    duration_months: Optional[int] = None
    duration_label: Optional[str] = None
    is_current: bool = False
    responsibilities: List[str] = Field(default_factory=list)
    technologies: List[str] = Field(default_factory=list)
    confidence: float = 1.0

class EducationItem(BaseModel):
    degree: Optional[str] = None
    field: Optional[str] = None
    institution: Optional[str] = None
    start_year: Optional[str] = None
    end_year: Optional[str] = None
    grade: Optional[str] = None
    confidence: float = 1.0

class ProjectItem(BaseModel):
    name: str
    description: Optional[str] = None
    technologies: List[str] = Field(default_factory=list)
    url: Optional[str] = None

class CareerGap(BaseModel):
    from_company: str
    to_company: str
    start_date: str
    end_date: str
    gap_months: int
    gap_label: str

class GapAnalysis(BaseModel):
    has_gap: bool = False
    total_gap_months: int = 0
    gaps: List[CareerGap] = Field(default_factory=list)
    status_text: str = "Continuous work history"

class ParsedCVSchema(BaseModel):
    document_type: str = "CV"
    candidate: CandidateContact = Field(default_factory=CandidateContact)
    current_title: Optional[str] = None
    current_company: Optional[str] = None
    summary: Optional[str] = None
    skills: List[SkillItem] = Field(default_factory=list)
    skill_names: List[str] = Field(default_factory=list)
    experience: List[ExperienceItem] = Field(default_factory=list)
    education: List[EducationItem] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    projects: List[ProjectItem] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    total_experience_years: Optional[float] = None
    total_experience_label: Optional[str] = None
    notice_period: Optional[str] = None
    gap_analysis: GapAnalysis = Field(default_factory=GapAnalysis)
    raw_sections: List[Dict[str, Any]] = Field(default_factory=list)
    confidence: Dict[str, float] = Field(default_factory=dict)
    evidence: List[FieldEvidence] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
