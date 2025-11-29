from datetime import timedelta

from app.core.security import create_access_token, decode_access_token, get_password_hash, verify_password


def test_password_hash_roundtrip():
    password = "secret123"
    hashed = get_password_hash(password)
    assert verify_password(password, hashed)
    assert not verify_password("wrong", hashed)


def test_jwt_roundtrip():
    token = create_access_token("42", expires_delta=timedelta(minutes=1))
    assert decode_access_token(token) == "42"
