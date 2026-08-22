// Dynamic Destination Photo Fetcher API via Wikipedia & Unsplash

const CURATED_DESTINATION_IMAGES = {
  goa: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
  manali: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
  jaipur: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
  ladakh: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80',
  mysore: 'https://images.unsplash.com/photo-1600100397608-f090742f40b2?auto=format&fit=crop&w=1200&q=80',
  kerala: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
  dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
  rishikesh: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80',
  udaipur: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f1c?auto=format&fit=crop&w=1200&q=80',
  shimla: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=1200&q=80',
  varanasi: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
  ooty: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1200&q=80',
  agra: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
  tokyo: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
  london: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
  sydney: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80',
  singapore: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80',
  bangkok: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80',
  rome: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
  barcelona: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200&q=80',
  'new york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
  kathmandu: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
  munich: 'https://images.unsplash.com/photo-1595867818082-083862f3d630?auto=format&fit=crop&w=1200&q=80',
  cairo: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1200&q=80',
  zurich: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=1200&q=80',
  reykjavik: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=80',
  seoul: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=1200&q=80',
  'cape town': 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80',
  amsterdam: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=1200&q=80',
  toronto: 'https://images.unsplash.com/photo-1517935703635-27c737826572?auto=format&fit=crop&w=1200&q=80',
  default: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
};

const imageCache = {};

export const fetchDestinationImage = async (destinationName) => {
  if (!destinationName) return CURATED_DESTINATION_IMAGES.default;

  const key = destinationName.toLowerCase().trim();

  // 1. Check in-memory cache
  if (imageCache[key]) return imageCache[key];

  // 2. Check curated dictionary
  if (CURATED_DESTINATION_IMAGES[key]) {
    imageCache[key] = CURATED_DESTINATION_IMAGES[key];
    return CURATED_DESTINATION_IMAGES[key];
  }

  // 3. Dynamic search match in dictionary (e.g. "goa beach" -> "goa")
  for (const [dictKey, url] of Object.entries(CURATED_DESTINATION_IMAGES)) {
    if (key.includes(dictKey) || dictKey.includes(key)) {
      imageCache[key] = url;
      return url;
    }
  }

  // 4. Fetch dynamically via Wikipedia Summary REST API
  try {
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(destinationName)}`,
      {
        headers: { 'User-Agent': 'WanderWaveTravel/1.0' },
      }
    );

    if (response.ok) {
      const data = await response.json();
      const imageUrl = data?.originalimage?.source || data?.thumbnail?.source;

      if (imageUrl) {
        imageCache[key] = imageUrl;
        return imageUrl;
      }
    }
  } catch (err) {
    console.warn(`[Image API Notice] Dynamic fetch for ${destinationName} fallback:`, err.message);
  }

  // 5. Dynamic Unsplash Topic photo fallback URL for worldwide city queries
  const dynamicUnsplashUrl = `https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80`;
  imageCache[key] = dynamicUnsplashUrl;
  return dynamicUnsplashUrl;
};
