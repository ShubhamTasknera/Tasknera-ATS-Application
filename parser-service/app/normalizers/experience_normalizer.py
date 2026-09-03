import re
from datetime import datetime
from typing import List, Tuple, Optional
from app.models.cv_schema import ExperienceItem, CareerGap, GapAnalysis

MONTH_NAMES = {
    "jan": 1, "january": 1, "feb": 2, "february": 2, "mar": 3, "march": 3,
    "apr": 4, "april": 4, "may": 5, "may": 5, "jun": 6, "june": 6,
    "jul": 7, "july": 7, "aug": 8, "august": 8, "sep": 9, "sept": 9,
    "september": 9, "oct": 10, "october": 10, "nov": 11, "november": 11,
    "dec": 12, "december": 12
}

def parse_date_string(date_str: Optional[str]) -> Optional[datetime]:
    """Parses a date string (e.g. 'Jan 2020', '03/2021', 'Present', '2019') into a datetime."""
    if not date_str:
        return None
    s = date_str.strip().lower()
    if s in ("present", "current", "now", "ongoing", "till date"):
        return datetime.now()
    
    # Month Year e.g. "Jan 2020", "March 2022"
    m_match = re.search(r'([a-z]+)\.?\s*[\'’]?(\d{2,4})', s)
    if m_match:
        m_name = m_match.group(1).lower()
        if m_name in MONTH_NAMES:
            month = MONTH_NAMES[m_name]
            year = int(m_match.group(2))
            if year < 100:
                year += 1900 if year > 50 else 2000
            return datetime(year, month, 1)
            
    # MM/YYYY e.g. "05/2019", "05-2021"
    num_match = re.search(r'(\d{1,2})[\/\.-](\d{2,4})', s)
    if num_match:
        month = max(1, min(12, int(num_match.group(1))))
        year = int(num_match.group(2))
        if year < 100:
            year += 1900 if year > 50 else 2000
        return datetime(year, month, 1)
        
    # Just year e.g. "2020"
    year_match = re.search(r'\b(19\d{2}|20\d{2})\b', s)
    if year_match:
        return datetime(int(year_match.group(1)), 1, 1)
        
    return None

def calculate_tenure_and_gaps(experiences: List[ExperienceItem]) -> Tuple[float, str, GapAnalysis]:
    """
    Calculates total non-overlapping professional tenure in years and detects employment gaps.
    Excludes student projects and training.
    """
    intervals = []
    
    for exp in experiences:
        dt_start = parse_date_string(exp.start_date)
        dt_end = parse_date_string(exp.end_date)
        
        if dt_start and dt_end and dt_end >= dt_start:
            intervals.append({
                "start": dt_start,
                "end": dt_end,
                "company": exp.company or "Organization",
                "raw_start": exp.start_date,
                "raw_end": exp.end_date
            })
            months = (dt_end.year - dt_start.year) * 12 + (dt_end.month - dt_start.month) + 1
            exp.duration_months = max(1, months)
            exp.duration_label = f"{months // 12}y {months % 12}m" if months >= 12 else f"{months}m"
        elif dt_start:
            # Assume 1 year if single date
            exp.duration_months = 12
            exp.duration_label = "1 year"
            
    if not intervals:
        return 0.0, "0 yrs", GapAnalysis()
        
    # Sort chronologically by start date
    intervals.sort(key=lambda x: x["start"])
    
    # Merge overlapping intervals for total tenure
    merged = []
    for cur in intervals:
        if not merged:
            merged.append({"start": cur["start"], "end": cur["end"]})
        else:
            prev = merged[-1]
            if cur["start"] <= prev["end"]:
                prev["end"] = max(prev["end"], cur["end"])
            else:
                merged.append({"start": cur["start"], "end": cur["end"]})
                
    total_months = 0
    for block in merged:
        m = (block["end"].year - block["start"].year) * 12 + (block["end"].month - block["start"].month) + 1
        total_months += max(1, m)
        
    total_years = round(total_months / 12.0, 1)
    label = f"{total_years:.1f} yrs" if total_years % 1 != 0 else f"{int(total_years)} yrs"
    
    # Identify gaps between consecutive roles (> 2 months)
    gaps: List[CareerGap] = []
    total_gap_months = 0
    
    for i in range(len(intervals) - 1):
        prev_role = intervals[i]
        next_role = intervals[i + 1]
        
        if next_role["start"] > prev_role["end"]:
            diff_months = (next_role["start"].year - prev_role["end"].year) * 12 + (next_role["start"].month - prev_role["end"].month)
            if diff_months >= 2:
                gap_label = f"{diff_months // 12}y {diff_months % 12}m" if diff_months >= 12 else f"{diff_months} months"
                gaps.append(CareerGap(
                    from_company=prev_role["company"],
                    to_company=next_role["company"],
                    start_date=prev_role["raw_end"] or prev_role["end"].strftime("%b %Y"),
                    end_date=next_role["raw_start"] or next_role["start"].strftime("%b %Y"),
                    gap_months=diff_months,
                    gap_label=gap_label
                ))
                total_gap_months += diff_months
                
    gap_analysis = GapAnalysis(
        has_gap=len(gaps) > 0,
        total_gap_months=total_gap_months,
        gaps=gaps,
        status_text=f"{total_gap_months} months career gap detected across {len(gaps)} transitions." if gaps else "Continuous work history (No significant gap)"
    )
    
    return total_years, label, gap_analysis
