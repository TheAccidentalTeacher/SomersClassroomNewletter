from pathlib import Path
from jinja2 import Environment, FileSystemLoader, select_autoescape
from .config import AppConfig

TEMPLATES_DIR = Path(__file__).parent / "templates"

_env = Environment(
    loader=FileSystemLoader(str(TEMPLATES_DIR)),
    autoescape=select_autoescape(["html"]),
    enable_async=False,
    trim_blocks=True,
    lstrip_blocks=True,
)

def render_newsletter(content: dict, cfg: AppConfig) -> str:
    template = _env.get_template("newsletter.html")
    return template.render(content=content, cfg=cfg)
