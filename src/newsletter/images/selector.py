from pathlib import Path
from .providers import ImageRequest, ImageResult, LocalProvider
from ..config import AppConfig


def choose_image(topic: str, cfg: AppConfig) -> ImageResult:
    # Start with local assets; later expand to API providers
    assets = [
        str(Path(cfg.assets_dir) / "images" / "panther" / "header.png"),
        str(Path(cfg.assets_dir) / "images" / "panther" / "badge.png"),
    ]
    provider = LocalProvider(assets)
    return provider.fetch(ImageRequest(prompt=topic))
