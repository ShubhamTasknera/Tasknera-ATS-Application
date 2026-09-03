import re
from typing import List, Tuple

# Strict equivalent synonym mappings
SYNONYM_DICT = {
    "js": "JavaScript",
    "javascript": "JavaScript",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "py": "Python",
    "python": "Python",
    "golang": "Go",
    "go lang": "Go",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "k8s": "Kubernetes",
    "kubernetes": "Kubernetes",
    "aws": "Amazon Web Services (AWS)",
    "amazon web services": "Amazon Web Services (AWS)",
    "gcp": "Google Cloud Platform (GCP)",
    "google cloud": "Google Cloud Platform (GCP)",
    "azure": "Microsoft Azure",
    "microsoft azure": "Microsoft Azure",
    "ml": "Machine Learning",
    "machine learning": "Machine Learning",
    "nlp": "Natural Language Processing (NLP)",
    "natural language processing": "Natural Language Processing (NLP)",
    "llm": "Large Language Models (LLM)",
    "llms": "Large Language Models (LLM)",
    "large language model": "Large Language Models (LLM)",
    "large language models": "Large Language Models (LLM)",
    "rag": "Retrieval-Augmented Generation (RAG)",
    "retrieval augmented generation": "Retrieval-Augmented Generation (RAG)",
    "fastapi": "FastAPI",
    "django": "Django",
    "flask": "Flask",
    "react": "React",
    "react.js": "React",
    "reactjs": "React",
    "react native": "React Native",
    "next.js": "Next.js",
    "nextjs": "Next.js",
    "node": "Node.js",
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "langchain": "LangChain",
    "langgraph": "LangGraph",
    "llamaindex": "LlamaIndex",
    "docker": "Docker",
    "terraform": "Terraform",
    "graphql": "GraphQL",
    "rest": "REST APIs",
    "restful api": "REST APIs",
    "rest api": "REST APIs",
    "ci/cd": "CI/CD",
    "cicd": "CI/CD",
}

# Strict non-equivalent checks to prevent false merges
NON_EQUIVALENT_PAIRS = [
    ("LangChain", "LangGraph"),
    ("Python", "FastAPI"),
    ("Docker", "Kubernetes"),
    ("Machine Learning", "Large Language Models (LLM)"),
    ("Machine Learning", "Generative AI"),
    ("React", "React Native"),
    ("Amazon Web Services (AWS)", "AWS Bedrock"),
]

def normalize_skill_name(raw_skill: str) -> str:
    """Normalizes skill aliases to canonical naming while respecting strict boundaries."""
    if not raw_skill:
        return ""
    clean = raw_skill.strip()
    key = clean.lower()
    return SYNONYM_DICT.get(key, clean)

def deduplicate_skills(skills: List[str]) -> List[str]:
    """Deduplicates normalized skill names while preserving ordering."""
    seen = set()
    result = []
    for s in skills:
        norm = normalize_skill_name(s)
        if norm and norm.lower() not in seen:
            seen.add(norm.lower())
            result.append(norm)
    return result
