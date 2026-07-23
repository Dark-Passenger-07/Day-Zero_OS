import fitz # PyMuPDF
import os

def pdf_to_text(pdf_path, txt_path):
    if not os.path.exists(pdf_path):
        print(f"File not found: {pdf_path}")
        return
    print(f"Extracting {pdf_path} to {txt_path}...")
    doc = fitz.open(pdf_path)
    with open(txt_path, "w", encoding="utf-8") as f:
        for page_num, page in enumerate(doc):
            f.write(f"\n--- PAGE {page_num + 1} ---\n")
            f.write(page.get_text())

pdf_to_text("docs/PRD.pdf", "docs/PRD.txt")
pdf_to_text("docs/PRODUCT COMPLETION SPECIFICATION (PCS).pdf", "docs/PCS.txt")
print("Extraction completed!")
