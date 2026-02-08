"""
Bodrum Events Scraper
=====================
crawl4ai + Gemini 1.5 Flash ile Bodrum etkinliklerini çeken async script.
Çıktı: bodrum_events.json

Kurulum:
    pip install crawl4ai google-generativeai pydantic python-dotenv
    playwright install
"""

import asyncio
import json
import os
import sys
from datetime import datetime
from typing import Optional

from dotenv import load_dotenv
from pydantic import BaseModel, Field

# .env dosyasından API anahtarlarını oku
load_dotenv()

# ============ Pydantic Modeller ============

class BodrumEvent(BaseModel):
    """Tek bir etkinlik için veri modeli."""
    event_name: str = Field(..., description="Etkinliğin adı")
    event_date: str = Field(..., description="ISO 8601 formatında tarih (YYYY-MM-DD)")
    event_time: str = Field(default="", description="Saat (HH:MM formatında)")
    location: str = Field(default="Bodrum", description="Mekan adı")
    ticket_url: str = Field(default="", description="Bilet/detay linki")
    description: str = Field(default="", description="Kısa açıklama")
    category: str = Field(default="", description="Etkinlik kategorisi (konser, tiyatro, festival vb.)")
    image_url: str = Field(default="", description="Etkinlik görseli URL'si")


class EventsResult(BaseModel):
    """Tüm etkinliklerin sonuç modeli."""
    events: list[BodrumEvent] = []
    scraped_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    source_url: str = ""
    total_count: int = 0


# ============ Scraping Fonksiyonları ============

# Hedef URL'ler
TARGET_URLS = [
    "https://www.biletix.com/search/TURKIYE/tr?searchq=bodrum",
    "https://www.passo.com.tr/tr/sehir/bodrum",
]


async def scrape_page(url: str) -> Optional[str]:
    """
    crawl4ai ile sayfayı çeker ve Markdown formatında döndürür.
    Tarayıcı açıp JavaScript render yapabilir.
    """
    try:
        from crawl4ai import AsyncWebCrawler
        from crawl4ai import CrawlerRunConfig

        config = CrawlerRunConfig(
            word_count_threshold=50,  # Kısa paragrafları filtrele
            wait_until="domcontentloaded",
            page_timeout=30000,
        )

        async with AsyncWebCrawler() as crawler:
            result = await crawler.arun(url=url, config=config)

            if result.success and result.markdown:
                print(f"✅ Sayfa başarıyla çekildi: {url}")
                print(f"   Markdown uzunluğu: {len(result.markdown)} karakter")
                # Token limitini aşmamak için ilk 15000 karakter
                return result.markdown[:15000]
            else:
                print(f"⚠️  Sayfa çekilemedi: {url}")
                return None

    except ImportError:
        print("❌ crawl4ai kütüphanesi bulunamadı. pip install crawl4ai")
        return None
    except Exception as e:
        print(f"❌ Scraping hatası ({url}): {e}")
        return None


async def extract_events_with_gemini(markdown_content: str, source_url: str) -> list[BodrumEvent]:
    """
    Markdown içeriğini Gemini 1.5 Flash modeline gönderip
    yapılandırılmış etkinlik verisi çıkarır.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("❌ GEMINI_API_KEY environment variable bulunamadı!")
        print("   .env dosyasına GEMINI_API_KEY=your_key ekleyin.")
        return []

    try:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")

        current_year = datetime.now().year

        prompt = f"""
Sen bir etkinlik veri çıkarma uzmanısın. Aşağıdaki web sayfası içeriğinden 
Bodrum'da gerçekleşecek etkinlikleri (konserler, festivaller, tiyatro, sergiler vb.) çıkar.

KURALLAR:
1. Navigasyon, footer, reklam gibi gereksiz metinleri yok say.
2. Sadece etkinlik listesine odaklan.
3. Tarihler ISO 8601 formatında (YYYY-MM-DD) olmalı. Yıl yoksa {current_year} varsay.
4. Saatler HH:MM formatında olmalı.
5. Etkinlik linki varsa ticket_url alanına ekle, yoksa boş bırak.
6. Kategoriyi belirle: konser, tiyatro, festival, sergi, spor, parti, workshop vb.
7. Her etkinlik için kısa bir açıklama yaz.

ÇIKTI FORMATI (JSON dizisi):
[
    {{
        "event_name": "Etkinlik Adı",
        "event_date": "2025-07-15",
        "event_time": "21:00",
        "location": "Mekan Adı, Bodrum",
        "ticket_url": "https://...",
        "description": "Kısa açıklama",
        "category": "konser",
        "image_url": ""
    }}
]

Eğer hiç etkinlik bulunamazsa boş dizi [] döndür.
Yanıtında SADECE JSON dizisini ver, başka bir şey yazma.

---
SAYFA İÇERİĞİ:
{markdown_content}
"""

        response = await asyncio.to_thread(
            model.generate_content, prompt
        )

        # JSON'u parse et
        text = response.text.strip()
        # Markdown code block varsa temizle
        if text.startswith("```"):
            text = text.split("\n", 1)[1]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()

        events_data = json.loads(text)

        events = []
        for item in events_data:
            try:
                event = BodrumEvent(**item)
                events.append(event)
            except Exception as e:
                print(f"⚠️  Etkinlik parse hatası: {e}")
                continue

        print(f"✅ {len(events)} etkinlik çıkarıldı ({source_url})")
        return events

    except ImportError:
        print("❌ google-generativeai kütüphanesi bulunamadı. pip install google-generativeai")
        return []
    except json.JSONDecodeError as e:
        print(f"❌ JSON parse hatası: {e}")
        return []
    except Exception as e:
        print(f"❌ Gemini API hatası: {e}")
        return []


async def scrape_all_events() -> EventsResult:
    """Tüm hedef URL'leri tarar ve etkinlikleri toplar."""
    all_events: list[BodrumEvent] = []

    for url in TARGET_URLS:
        print(f"\n🔍 Taraniyor: {url}")
        markdown = await scrape_page(url)

        if markdown:
            events = await extract_events_with_gemini(markdown, url)
            all_events.extend(events)

    # Sonuçları oluştur
    result = EventsResult(
        events=all_events,
        source_url=", ".join(TARGET_URLS),
        total_count=len(all_events),
    )

    return result


def save_results(result: EventsResult, output_path: str = "bodrum_events.json"):
    """Sonuçları JSON dosyasına kaydet."""
    output = result.model_dump()

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n💾 Sonuçlar kaydedildi: {output_path}")
    print(f"   Toplam etkinlik sayısı: {result.total_count}")


# ============ Ana Program ============

async def main():
    """Ana asenkron fonksiyon."""
    print("=" * 60)
    print("🎭 Bodrum Etkinlikleri Scraper")
    print(f"📅 Çalıştırma zamanı: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("=" * 60)

    result = await scrape_all_events()

    if result.total_count > 0:
        save_results(result)
    else:
        print("\n⚠️  Hiç etkinlik bulunamadı.")
        # Boş bile olsa dosyayı oluştur
        save_results(result)

    print("\n✨ Tamamlandı!")
    return result


if __name__ == "__main__":
    asyncio.run(main())
