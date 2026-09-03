import re
from typing import Optional, Tuple
from app.models.jd_schema import SalarySchema

def normalize_salary(raw_text: Optional[str]) -> SalarySchema:
    """
    Parses salary strings into annual INR (min, max).
    Handles '6 LPA', '6–10 LPA', '₹6-10 Lakhs', '600000', etc.
    """
    if not raw_text or not raw_text.strip():
        return SalarySchema()
    
    text = raw_text.strip()
    
    # 1. Range in LPA: e.g. "6–10 LPA", "₹6.5 - 12.0 LPA", "6 to 10 Lakhs"
    lpa_range = re.search(r'(?:₹|INR|Rs\.?)?\s*(\d+(?:\.\d+)?)\s*(?:-|–|—|to)\s*(\d+(?:\.\d+)?)\s*(?:LPA|Lakhs?|Lacs?|L\b)', text, re.IGNORECASE)
    if lpa_range:
        min_val = int(float(lpa_range.group(1)) * 100000)
        max_val = int(float(lpa_range.group(2)) * 100000)
        return SalarySchema(
            min=min_val,
            max=max_val,
            raw_text=text,
            currency="INR",
            period="ANNUAL",
            formatted_label=f"₹{lpa_range.group(1)}–{lpa_range.group(2)} LPA"
        )
    
    # 2. Single LPA: e.g. "6 LPA", "8 Lakhs Per Annum"
    lpa_single = re.search(r'(?:₹|INR|Rs\.?)?\s*(\d+(?:\.\d+)?)\s*(?:LPA|Lakhs?|Lacs?|L\b)', text, re.IGNORECASE)
    if lpa_single:
        val = int(float(lpa_single.group(1)) * 100000)
        return SalarySchema(
            min=val,
            max=val,
            raw_text=text,
            currency="INR",
            period="ANNUAL",
            formatted_label=f"₹{lpa_single.group(1)} LPA"
        )
    
    # 3. Direct numeric amounts: e.g. "600000 - 1000000", "₹800,000"
    num_range = re.search(r'(?:₹|INR|Rs\.?)?\s*(\d{1,3}(?:,\d{3})*|\d+)\s*(?:-|–|—|to)\s*(\d{1,3}(?:,\d{3})*|\d+)', text)
    if num_range:
        min_raw = int(num_range.group(1).replace(',', ''))
        max_raw = int(num_range.group(2).replace(',', ''))
        # If numbers are large enough to be annual salary in INR
        if min_raw >= 100000:
            return SalarySchema(
                min=min_raw,
                max=max_raw,
                raw_text=text,
                currency="INR",
                period="ANNUAL",
                formatted_label=f"₹{min_raw/100000:.1f}–{max_raw/100000:.1f} LPA"
            )
            
    num_single = re.search(r'(?:₹|INR|Rs\.?)?\s*(\d{1,3}(?:,\d{3})*|\d+)', text)
    if num_single:
        val = int(num_single.group(1).replace(',', ''))
        if val >= 100000:
            return SalarySchema(
                min=val,
                max=val,
                raw_text=text,
                currency="INR",
                period="ANNUAL",
                formatted_label=f"₹{val/100000:.1f} LPA"
            )
            
    return SalarySchema(raw_text=text)
