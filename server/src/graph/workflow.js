/**
 * Fully Dynamic Requirement Analysis Engine for Express Backend & Fallback
 */
export const runRequirementAnalysis = async (userRequest = '', userLongTermPreferences = {}, payloadObj = {}) => {
  const text = (userRequest || '').toLowerCase().trim();

  // 1. Destination Extraction: Clean prefixes like 'visit ', 'trip to ', 'to '
  let destination = payloadObj.destination ? payloadObj.destination.trim() : '';

  // Extract from prompt text if available
  const toMatch = text.match(/(?:to|visit|into|towards)\s+([a-zA-Z\s]+?)(?=\s+(?:from|under|for|with|in|\d)|$)/i);
  if (toMatch && toMatch[1]) {
    let extracted = toMatch[1].trim();
    // Clean leading stop words
    extracted = extracted.replace(/^(visit|to|trip|go|stay)\s+/i, '');
    if (extracted.length > 1) {
      destination = extracted;
    }
  }

  if (!destination || destination.toLowerCase() === 'visit') {
    if (text.includes('hyderabad')) destination = 'Hyderabad';
    else if (text.includes('dubai')) destination = 'Dubai';
    else if (text.includes('goa')) destination = 'Goa';
    else if (text.includes('ladakh') || text.includes('leh')) destination = 'Ladakh';
    else if (text.includes('kerala')) destination = 'Kerala';
    else if (text.includes('jaipur')) destination = 'Jaipur';
    else if (text.includes('mumbai')) destination = 'Mumbai';
    else if (text.includes('manali')) destination = 'Manali';
    else destination = payloadObj.destination || 'Dubai';
  }

  // Clean and format destination name
  destination = destination.replace(/^(visit|to|trip|go)\s+/i, '').trim();
  destination = destination.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

  // 2. Origin City Extraction
  let startingCity = payloadObj.startingCity || 'Delhi';
  const fromMatch = text.match(/from\s+([a-zA-Z]+)/i);
  if (fromMatch && fromMatch[1]) {
    startingCity = fromMatch[1].charAt(0).toUpperCase() + fromMatch[1].slice(1).toLowerCase();
  }

  // 3. Duration Extraction
  let duration = payloadObj.duration || 5;
  const dayMatch = text.match(/(\d+)\s*(day|days)/);
  if (dayMatch) duration = parseInt(dayMatch[1], 10);

  // 4. Budget Extraction
  let budget = payloadObj.budget || 30000;
  const kMatch = text.match(/(\d+)\s*k/i);
  const numMatch = text.match(/(\d{4,6})/);
  if (kMatch) budget = parseInt(kMatch[1], 10) * 1000;
  else if (numMatch) budget = parseInt(numMatch[1], 10);

  // 5. Travelers Extraction
  let travelers = payloadObj.travelers || 2;
  const peopleMatch = text.match(/(\d+)\s*(people|person|traveler|travelers|friends)/i);
  if (peopleMatch) travelers = parseInt(peopleMatch[1], 10);

  // 6. Interests Extraction
  const interests = [];
  if (text.includes('trek') || text.includes('trekking')) interests.push('Trekking');
  if (text.includes('cafe') || text.includes('cafes') || text.includes('food')) interests.push('Cafes');
  if (text.includes('sightseeing') || text.includes('temple')) interests.push('Sightseeing');
  if (text.includes('beach') || text.includes('sea')) interests.push('Beaches');
  if (text.includes('adventure')) interests.push('Adventure Sports');
  if (!interests.length) interests.push('Sightseeing', 'Cafes');

  const travelStyle = payloadObj.travelStyle || userLongTermPreferences?.travelStyle || 'Adventure';

  return {
    destination,
    startingCity,
    duration,
    budget,
    travelers,
    interests,
    travelStyle,
    missingFields: [],
    userLongTermPreferences,
    agentLogs: [
      {
        agent: 'Requirement Analyzer Agent',
        status: 'SUCCESS',
        timestamp: new Date().toLocaleTimeString(),
        details: `Parsed requirement for ${destination} (${duration} days, INR ${budget.toLocaleString()}, ${travelers} travelers).`,
      },
    ],
  };
};
