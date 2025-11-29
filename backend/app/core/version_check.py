import sys

import pydantic

MIN_PYDANTIC = (1, 10, 0)
EXPECTED_MINOR = 10


def verify_dependencies() -> None:
    """Fail fast on incompatible Python/pydantic versions."""
    py_version = sys.version_info
    py_str = sys.version.split()[0]

    pd_version_str = pydantic.__version__
    pd_version = tuple(int(part) for part in pd_version_str.split(".")[:3])
    pd_major, pd_minor = pd_version[0], pd_version[1]

    if py_version >= (3, 12) and pd_major == 1:
        raise RuntimeError(
            f"Pydantic v1 ({pd_version_str}) is not compatible with Python {py_str}. "
            "Use Python 3.11 with pydantic 1.10.x."
        )

    if pd_major != 1 or pd_minor != EXPECTED_MINOR or pd_version < MIN_PYDANTIC:
        raise RuntimeError(
            f"Unsupported pydantic version {pd_version_str}. "
            f"Use pydantic 1.10.x with Python {py_str}."
        )
