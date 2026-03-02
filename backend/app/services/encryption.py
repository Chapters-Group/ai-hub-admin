import base64

from cryptography.fernet import Fernet

from app.config import settings


def _get_fernet() -> Fernet:
    key = settings.ENCRYPTION_KEY
    # Key should be a valid Fernet key (44-char url-safe base64 string)
    return Fernet(key.encode())


def encrypt_api_key(plain_key: str) -> str:
    return _get_fernet().encrypt(plain_key.encode()).decode()


def decrypt_api_key(encrypted_key: str) -> str:
    return _get_fernet().decrypt(encrypted_key.encode()).decode()
