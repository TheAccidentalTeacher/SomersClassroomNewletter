from pathlib import Path
import sys
import click
from .config import AppConfig
from .content import load_content
from .render import render_newsletter

@click.group(help="Glennallen Panthers Newsletter Generator")
def cli():
    pass

@cli.command()
@click.option('--data', type=click.Path(exists=True, dir_okay=False), required=True,
              help='Path to YAML/JSON weekly content')
@click.option('--out', 'out_dir', type=click.Path(file_okay=False), required=True,
              help='Output directory')
@click.option('--open', 'open_after', is_flag=True, default=False, help='Open output HTML')
def generate(data: str, out_dir: str, open_after: bool):
    cfg = AppConfig()
    content = load_content(data)

    html = render_newsletter(content, cfg)

    out_path = Path(out_dir)
    out_path.mkdir(parents=True, exist_ok=True)
    index_html = out_path / 'index.html'
    index_html.write_text(html, encoding='utf-8')
    click.echo(f"Wrote {index_html}")

    if open_after:
        try:
            if sys.platform.startswith('win'):
                import os
                os.startfile(str(index_html))
            elif sys.platform == 'darwin':
                import subprocess; subprocess.run(['open', str(index_html)], check=False)
            else:
                import subprocess; subprocess.run(['xdg-open', str(index_html)], check=False)
        except Exception:
            pass

if __name__ == '__main__':
    cli()
