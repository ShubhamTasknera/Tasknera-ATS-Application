import os
import re
import json
from typing import Dict, Any, List, Tuple, Optional
from rapidfuzz import fuzz

CONFIG_DIR = os.path.join(os.path.dirname(__file__), "..", "config")
TAXONOMY_FILE = os.path.join(CONFIG_DIR, "taxonomy.json")

try:
    with open(TAXONOMY_FILE, "r", encoding="utf-8") as f:
        TAXONOMY = json.load(f)
except Exception:
    TAXONOMY = {"synonyms": {}, "non_equivalences": []}

SYNONYMS = TAXONOMY.get("synonyms", {})
NON_EQUIVALENCES = [set(pair) for pair in TAXONOMY.get("non_equivalences", [])]

# Lazy-loaded embedding model for cosine similarity calculation only
_EMBEDDING_MODEL = None

def get_embedding_model():
    global _EMBEDDING_MODEL
    if _EMBEDDING_MODEL is None:
        enable_emb = os.environ.get("ENABLE_LOCAL_EMBEDDINGS", "0").lower() in ("1", "true", "yes")
        if enable_emb:
            try:
                from sentence_transformers import SentenceTransformer
                _EMBEDDING_MODEL = SentenceTransformer("all-MiniLM-L6-v2", local_files_only=False)
            except Exception:
                _EMBEDDING_MODEL = False
        else:
            _EMBEDDING_MODEL = False
    return _EMBEDDING_MODEL if _EMBEDDING_MODEL is not False else None

def are_forbidden_equivalences(term_a: str, term_b: str) -> bool:
    """
    Checks whether two terms are explicitly forbidden from being equated
    (e.g., Java vs JavaScript, C vs C++, SQL vs NoSQL, React vs React Native).
    """
    a = term_a.strip().lower()
    b = term_b.strip().lower()
    if a == b:
        return False
    pair_set = {a, b}
    for forbidden in NON_EQUIVALENCES:
        if pair_set == forbidden:
            return True
    return False

def get_synonym_group(term: str) -> List[str]:
    """
    Returns the canonical term and all valid aliases for a skill/concept.
    """
    clean_term = term.strip().lower()
    results = {clean_term}
    for canon, aliases in SYNONYMS.items():
        all_group = [canon] + aliases
        if clean_term in all_group:
            for s in all_group:
                results.add(s)
    return list(results)

def find_evidence_snippet(text: str, target_terms: List[str], base_term: str = "") -> Tuple[Optional[str], float]:
    """
    Scans candidate CV paragraphs or bullet points to extract the best matching
    evidence sentence and its match confidence.
    """
    sentences = re.split(r'(?<=[.!?\n])\s+', text)
    best_sentence = None
    best_score = 0.0

    for sentence in sentences:
        clean_s = sentence.strip()
        if len(clean_s) < 10 or len(clean_s) > 400:
            continue
        
        lower_s = clean_s.lower()
        for term in target_terms:
            # Word boundary check
            pattern = r'(?:^|[^a-zA-Z0-9_#+])' + re.escape(term) + r'(?:$|[^a-zA-Z0-9_#+])'
            if re.search(pattern, lower_s):
                score = 1.0
                if score > best_score:
                    best_score = score
                    best_sentence = clean_s
            elif len(term) >= 6 and len(term.split()) > 1:
                # Fuzzy partial ratio only for multi-word phrases (len >= 6), NEVER for single short tokens
                ratio = fuzz.partial_ratio(term, lower_s) / 100.0
                if ratio > 0.88 and ratio > best_score:
                    best_score = ratio
                    best_sentence = clean_s

    return best_sentence, best_score

def match_criterion(
    criterion_text: str,
    cv_text: str,
    negated_terms: Optional[List[str]] = None,
    category: str = "Core Skill"
) -> Dict[str, Any]:
    """
    Evaluates a single JD requirement against the candidate CV.
    Returns status: FULLY_MET, PARTIALLY_MET, NOT_MET, NOT_FOUND, or NEEDS_VERIFICATION.
    """
    negated = [n.lower() for n in (negated_terms or [])]
    clean_crit = criterion_text.strip()
    clean_crit_lower = clean_crit.lower()

    # 1. Expand synonyms
    synonym_variants = get_synonym_group(clean_crit_lower)
    core_term = re.sub(r'^(?:relevant\s+background\s+in|proven\s+experience\s+in|hands-on\s+experience\s+with|experience\s+in|strong\s+knowledge\s+of|proficiency\s+in)\s+', '', clean_crit_lower).strip()
    if core_term and core_term != clean_crit_lower:
        for v in get_synonym_group(core_term):
            if v not in synonym_variants:
                synonym_variants.append(v)

    # 2. Check if the requirement is explicitly negated in candidate CV
    for neg in negated:
        neg_clean = neg.strip().lower()
        for syn in synonym_variants:
            # Check exact match or boundary match inside negated token
            if syn == neg_clean or re.search(r'(?:^|[^a-zA-Z0-9_#+])' + re.escape(syn) + r'(?:$|[^a-zA-Z0-9_#+])', neg_clean):
                return {
                    "status": "NOT_MET",
                    "score": 0.0,
                    "max_score": 1.0,
                    "confidence_score": 1.0,
                    "evidence_quote": f"Explicitly negated in candidate CV: '{neg}'",
                    "explanation": f"Candidate explicitly stated a lack of experience with '{neg}' (NegEx match).",
                    "matched_terms": []
                }

    # 3. Check exact word-boundary matches in CV
    matched_exact = []
    for syn in synonym_variants:
        # Check non-equivalence
        if are_forbidden_equivalences(clean_crit_lower, syn):
            continue
        pattern = r'(?:^|[^a-zA-Z0-9_#+])' + re.escape(syn) + r'(?:$|[^a-zA-Z0-9_#+])'
        if re.search(pattern, cv_text, re.IGNORECASE):
            matched_exact.append(syn)

    evidence_quote, match_confidence = find_evidence_snippet(cv_text, synonym_variants, clean_crit_lower)

    if matched_exact:
        return {
            "status": "FULLY_MET",
            "score": 1.0,
            "max_score": 1.0,
            "confidence_score": 1.0,
            "evidence_quote": evidence_quote or f"Matched keyword '{matched_exact[0]}' in candidate document.",
            "explanation": f"Exact requirement met via keyword match ('{matched_exact[0]}').",
            "matched_terms": matched_exact
        }

    # 4. RapidFuzz token set ratio matching
    cv_lower = cv_text.lower()
    best_fuzzy = 0.0
    for syn in synonym_variants:
        if are_forbidden_equivalences(clean_crit_lower, syn):
            continue
        fuzzy_score = fuzz.token_set_ratio(syn, cv_lower) / 100.0
        if fuzzy_score > best_fuzzy:
            best_fuzzy = fuzzy_score

    # 5. Local Embedding Cosine Similarity (pure numeric score, no text generation)
    embedding_score = 0.0
    embed_model = get_embedding_model()
    if embed_model is not None and evidence_quote:
        try:
            import numpy as np
            crit_emb = embed_model.encode(clean_crit)
            quote_emb = embed_model.encode(evidence_quote)
            # Cosine similarity
            cosine_sim = float(np.dot(crit_emb, quote_emb) / (np.linalg.norm(crit_emb) * np.linalg.norm(quote_emb)))
            embedding_score = max(0.0, min(1.0, cosine_sim))
        except Exception:
            embedding_score = 0.0

    combined_score = max(best_fuzzy, embedding_score, match_confidence)

    if combined_score >= 0.85:
        return {
            "status": "FULLY_MET",
            "score": 1.0,
            "max_score": 1.0,
            "confidence_score": round(combined_score, 2),
            "evidence_quote": evidence_quote,
            "explanation": f"High semantic and fuzzy concordance ({round(combined_score * 100)}%) with candidate experience.",
            "matched_terms": [clean_crit]
        }
    elif combined_score >= 0.65:
        return {
            "status": "PARTIALLY_MET",
            "score": 0.5,
            "max_score": 1.0,
            "confidence_score": round(combined_score, 2),
            "evidence_quote": evidence_quote,
            "explanation": f"Partial contextual overlap ({round(combined_score * 100)}%). Candidate demonstrates related skills.",
            "matched_terms": []
        }
    elif combined_score >= 0.45:
        return {
            "status": "NEEDS_VERIFICATION",
            "score": 0.0,
            "max_score": 1.0,
            "confidence_score": round(combined_score, 2),
            "evidence_quote": evidence_quote,
            "explanation": f"Ambiguous or weak mention ({round(combined_score * 100)}%). Recruiter verification advised.",
            "matched_terms": []
        }
    else:
        return {
            "status": "NOT_FOUND",
            "score": 0.0,
            "max_score": 1.0,
            "confidence_score": 1.0,
            "evidence_quote": None,
            "explanation": f"No direct or equivalent evidence for '{clean_crit}' found in candidate CV.",
            "matched_terms": []
        }
