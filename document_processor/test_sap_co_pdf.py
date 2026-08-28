import os
import sys

# Add document_processor directory to python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.pdf_parser import parse_pdf_bytes

def test_sap_co_pdf_extraction():
    print("====================================================")
    print("  PYTHON PYMUPDF TEST RUNNER: SAP CO CONSULTANT PDF ")
    print("====================================================\n")

    # Sample PDF Bytes generator simulating real SAP CO Consultant PDF text stream
    sample_sap_co_text = """Job Title: SAP CO Consultant
Company: TechCorp Industries
Location: New York, NY
Work Mode: Hybrid
Salary: $130,000 - $170,000

Overview:
We are seeking an experienced SAP CO Consultant with strong manufacturing domain knowledge.

Requirements:
- 5+ years SAP CO experience (Mandatory)
- 4+ years SAP S/4HANA experience (Mandatory)
- Manufacturing industry experience (Mandatory)
- SAP implementation project experience
- Bachelor's degree in Finance, Accounting or related field
- SAP certification (Preferred)
- Power BI experience (Preferred)

Responsibilities:
- Configure and customize SAP CO modules
- Lead S/4HANA implementation projects"""

    import fitz  # PyMuPDF
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), sample_sap_co_text)
    pdf_bytes = doc.tobytes()
    doc.close()

    result = parse_pdf_bytes(pdf_bytes)

    text = result["text"]
    char_count = result["characterCount"]
    word_count = result["wordCount"]
    page_count = result["pageCount"]

    print(f"Extraction Method: {result['extractionMethod']}")
    print(f"Page Count:        {page_count}")
    print(f"Character Count:   {char_count}")
    print(f"Word Count:        {word_count}")
    print(f"Text Quality:      {result['textQuality']}")
    print(f"OCR Used:          {result['ocrUsed']}\n")

    print("--------------------------------")
    print("FIRST 500 CHARACTERS OF EXTRACTED TEXT:")
    print("--------------------------------")
    print(text[:500])
    print("--------------------------------\n")

    assertions = [
        ("PDF Opens & Pages Detected", page_count >= 1),
        ("Text Extracted > Threshold", char_count > 100),
        ("Contains 'SAP CO Consultant'", "SAP CO Consultant" in text),
        ("Contains 'SAP CO'", "SAP CO" in text),
        ("Contains '5+ years'", "5+ years" in text),
        ("Contains 'S/4HANA'", "S/4HANA" in text),
        ("Contains 'Manufacturing'", "Manufacturing" in text),
        ("Contains 'Bachelor'", "Bachelor" in text),
        ("Contains 'certification'", "certification" in text.lower())
    ]

    all_passed = True
    for name, cond in assertions:
        if cond:
            print(f"[PASS] {name}")
        else:
            print(f"[FAIL] {name}")
            all_passed = False

    print("\n====================================================")
    if all_passed:
        print("  ALL PYTHON PYMUPDF EXTRACTION TESTS PASSED (100%)")
        print("====================================================\n")
        sys.exit(0)
    else:
        print("  SOME TESTS FAILED")
        print("====================================================\n")
        sys.exit(1)

if __name__ == "__main__":
    test_sap_co_pdf_extraction()
