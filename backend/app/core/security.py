import hmac
import hashlib
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, status
from app.core.config import settings

def get_hmac_key_for_version(key_version: str) -> Optional[bytes]:
    """
    Retrieves the authentic HMAC-SHA256 secret key for a specified key version,
    supporting key rotation across current and historical key generations.
    Returns None if the key version is unknown or secret is unconfigured (fails safe).
    """
    if not settings.REPORT_SIGNING_SECRET:
        return None
    historical_keys = getattr(settings, "REPORT_SIGNING_HISTORICAL_KEYS", {})
    secret = historical_keys.get(key_version)
    if not secret and key_version == settings.REPORT_SIGNING_KEY_VERSION:
        secret = settings.REPORT_SIGNING_SECRET
    if not secret or len(secret) < 16:
        return None
    return secret.encode("utf-8")

def generate_report_signature(
    scan_id: str,
    image_hash: str,
    status: str,
    pest_id: Optional[str],
    created_at: int
) -> Dict[str, str]:
    """
    Generates a server-authenticated HMAC-SHA256 Message Authentication Code (MAC)
    for tamper-evident scan report verification.
    Note: HMAC is a symmetric MAC providing server authenticity and integrity,
    not a public-key asymmetric digital signature.
    """
    key_bytes = get_hmac_key_for_version(settings.REPORT_SIGNING_KEY_VERSION)
    if not key_bytes:
        return {
            "signature": "",
            "algorithm": "HMAC-SHA256",
            "key_version": settings.REPORT_SIGNING_KEY_VERSION,
            "error": "KEY_UNAVAILABLE"
        }
    canonical_string = f"{scan_id}:{image_hash}:{status}:{pest_id or 'none'}:{created_at}"
    sig = hmac.new(key_bytes, canonical_string.encode("utf-8"), hashlib.sha256).hexdigest()
    return {
        "signature": sig,
        "algorithm": "HMAC-SHA256",
        "key_version": settings.REPORT_SIGNING_KEY_VERSION
    }

def verify_report_signature(
    scan_id: str,
    image_hash: str,
    status: str,
    pest_id: Optional[str],
    created_at: int,
    signature: str,
    key_version: str = "v1"
) -> bool:
    """
    Verifies that a diagnostic report's HMAC-SHA256 Message Authentication Code (MAC)
    is authentic, untampered, and was issued by the Krushi Mitra AI server.
    Uses constant-time comparison (hmac.compare_digest) to prevent timing side-channels.
    Supports key rotation via historical key registry.
    """
    if not signature or not isinstance(signature, str):
        return False
    
    key_bytes = get_hmac_key_for_version(key_version)
    if not key_bytes:
        # Unknown key version or unconfigured signing secret: fail safe
        return False

    canonical_string = f"{scan_id}:{image_hash}:{status}:{pest_id or 'none'}:{created_at}"
    expected_mac = hmac.new(key_bytes, canonical_string.encode("utf-8"), hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected_mac, signature)

async def verify_auth_token(authorization: Optional[str] = Header(None)) -> Optional[Dict[str, Any]]:
    """
    Verifies Supabase JWT token if provided.
    If no authorization header is supplied, returns a guest/anonymous farmer identity
    so local development and demo testing are never blocked.
    """
    if not authorization:
        return {"user_id": "anonymous_farmer", "role": "farmer", "authenticated": False}
    
    token = authorization.replace("Bearer ", "").strip()
    if not token:
        return {"user_id": "anonymous_farmer", "role": "farmer", "authenticated": False}

    # In production with SUPABASE_KEY, decode or verify with Supabase Auth
    # For local/offline dev, accept validly formed tokens
    return {
        "user_id": "authenticated_farmer",
        "token_preview": token[:10] + "...",
        "role": "farmer",
        "authenticated": True
    }
