// Dynamic Destination Photo Fetcher API via Wikipedia & Unsplash

const CURATED_DESTINATION_IMAGES = {
  goa: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
  manali: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
  jaipur: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
  ladakh: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80',
  mysore: 'https://images.unsplash.com/photo-1600100397608-f090742f40b2?auto=format&fit=crop&w=1200&q=80',
  kerala: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
  dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
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

  // 3. Fetch dynamically via Wikipedia Summary REST API
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

  // 4. Fallback URL
  imageCache[key] = CURATED_DESTINATION_IMAGES.default;
  return CURATED_DESTINATION_IMAGES.default;
};
