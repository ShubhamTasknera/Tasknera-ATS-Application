import logging
import re

logger = logging.getLogger("parser_service")
logger.setLevel(logging.INFO)

if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter("[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)

def redact_pii(text: str) -> str:
    """Redacts emails and phone numbers for safe logging."""
    if not text:
        return ""
    # Redact email
    text = re.sub(r'([a-zA-Z0-9_.+-]+)@([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)', r'***@\2', text)
    # Redact 10+ digit phone numbers
    text = re.sub(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', r'***-***-****', text)
    return text

def log_info_safe(message: str):
    logger.info(redact_pii(message))

def log_warning_safe(message: str):
    logger.warning(redact_pii(message))

def log_error_safe(message: str, exc_info: bool = False):
    logger.error(redact_pii(message), exc_info=exc_info)
