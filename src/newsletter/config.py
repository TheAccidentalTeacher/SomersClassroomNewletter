from dataclasses import dataclass
import os
from dotenv import load_dotenv

load_dotenv()

@dataclass
class AppConfig:
    brand_name: str = os.getenv("BRAND_NAME", "Glennallen Panthers")
    primary_color: str = os.getenv("PRIMARY_COLOR", "#000000")
    accent_color: str = os.getenv("ACCENT_COLOR", "#C8102E")
    assets_dir: str = os.getenv("ASSETS_DIR", "assets")

    # API keys
    openai_api_key: str | None = os.getenv("OPENAI_API_KEY")
    stability_api_key: str | None = os.getenv("STABILITY_AI_API_KEY")
    replicate_api_token: str | None = os.getenv("REPLICATE_API_TOKEN")

    pexels_api_key: str | None = os.getenv("PEXELS_API_KEY")
    pixabay_api_key: str | None = os.getenv("PIXABAY_API_KEY")
    unsplash_access_key: str | None = os.getenv("UNSPLASH_ACCESS_KEY")
    openclipart_base_url: str = os.getenv("OPENCLIPART_BASE_URL", "https://openclipart.org")

    giphy_api_key: str | None = os.getenv("GIPHY_API_KEY")
    news_api_key: str | None = os.getenv("NEWS_API_KEY")
    reddit_client_id: str | None = os.getenv("REDDIT_CLIENT_ID")
    reddit_client_secret: str | None = os.getenv("REDDIT_CLIENT_SECRET")
