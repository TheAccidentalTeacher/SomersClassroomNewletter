from dataclasses import dataclass
from typing import Optional

@dataclass
class ImageRequest:
    prompt: str
    style: str | None = None
    hint: str | None = None

@dataclass
class ImageResult:
    url: Optional[str] = None
    path: Optional[str] = None
    attribution: Optional[str] = None

class ImageProvider:
    name = "base"
    def available(self) -> bool:
        return False
    def fetch(self, req: ImageRequest) -> ImageResult:
        return ImageResult()

class LocalProvider(ImageProvider):
    name = "local"
    def __init__(self, search_paths: list[str]):
        self.search_paths = search_paths
    def available(self) -> bool:
        return True
    def fetch(self, req: ImageRequest) -> ImageResult:
        # Minimal: return the first matching placeholder path if exists
        for p in self.search_paths:
            return ImageResult(path=p, attribution="Local asset")
        return ImageResult()
