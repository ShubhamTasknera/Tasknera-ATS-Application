import io
from typing import List, Dict, Any, Optional

def extract_tables_from_pdf_bytes(pdf_bytes: bytes) -> List[Dict[str, Any]]:
    """
    Extracts tabular data from PDF bytes using pdfplumber.
    Returns a list of extracted tables with page numbers, headers, and formatted rows.
    """
    tables_result = []
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page_idx, page in enumerate(pdf.pages):
                extracted_tables = page.extract_tables()
                for table in extracted_tables:
                    if not table or len(table) == 0:
                        continue
                    
                    # Clean rows
                    clean_rows = []
                    for row in table:
                        clean_row = [str(cell).strip() if cell is not None else "" for cell in row]
                        # Keep only rows that have at least one non-empty cell
                        if any(clean_row):
                            clean_rows.append(clean_row)
                    
                    if len(clean_rows) >= 2:
                        header = clean_rows[0]
                        data_rows = clean_rows[1:]
                        
                        # Generate markdown-formatted table representation
                        md_table = " | ".join(header) + "\n"
                        md_table += " | ".join(["---"] * len(header)) + "\n"
                        for r in data_rows:
                            # Pad row to match header length if needed
                            padded_r = r + [""] * max(0, len(header) - len(r))
                            md_table += " | ".join(padded_r[:len(header)]) + "\n"
                        
                        tables_result.append({
                            "page": page_idx + 1,
                            "header": header,
                            "rows": data_rows,
                            "markdown": md_table.strip()
                        })
    except Exception as e:
        # Table extraction should degrade gracefully without crashing text extraction
        pass
    
    return tables_result
