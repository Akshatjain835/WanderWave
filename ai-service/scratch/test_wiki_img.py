import requests

def get_destination_image(destination="Shimla"):
    print(f"--- Fetching Dynamic Image API for: {destination} ---")
    try:
        # 1. Wikipedia Summary API
        wiki_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{requests.utils.quote(destination)}"
        res = requests.get(wiki_url, headers={"User-Agent": "WanderWave/1.0"}, timeout=5).json()
        
        img_url = None
        if "originalimage" in res and res["originalimage"].get("source"):
            img_url = res["originalimage"]["source"]
        elif "thumbnail" in res and res["thumbnail"].get("source"):
            img_url = res["thumbnail"]["source"]
            
        if img_url:
            print(f"[Wikipedia API Success] {destination} Image: {img_url}")
            return img_url
        else:
            print(f"[Wikipedia API Notice] No image found in page summary for {destination}")
    except Exception as e:
        print(f"[Wikipedia API Error] {e}")

    # Fallback to Unsplash Source
    unsplash_url = f"https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80"
    print(f"[Fallback Image] {unsplash_url}")
    return unsplash_url

if __name__ == "__main__":
    get_destination_image("Shimla")
    get_destination_image("Paris")
    get_destination_image("Pondicherry")
    get_destination_image("Goa")
