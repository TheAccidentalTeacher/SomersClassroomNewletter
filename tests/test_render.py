from newsletter.config import AppConfig
from newsletter.content import load_content
from newsletter.render import render_newsletter


def test_render_smoke(tmp_path):
    cfg = AppConfig()
    data = load_content('data/sample_week.yml')
    html = render_newsletter(data, cfg)
    assert cfg.brand_name in html
    assert '6th Grade' in html
