import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { z } from 'zod';

// Define Zod Schema for Structured Output parsing
const RequirementAnalysisSchema = z.object({
  destination: z.string().describe('The primary destination city or location requested by the user, e.g. Manali, Goa, Ladakh'),
  startingCity: z.string().describe('The origin city where the travel starts, e.g. Delhi, Mumbai, Bangalore'),
  duration: z.number().describe('Number of days for the trip (integer, e.g. 5)'),
  budget: z.number().describe('Total budget allocated in INR or local currency as a numeric value (e.g. 30000 for 30k)'),
  travelers: z.number().describe('Number of people travelling (integer, e.g. 2)'),
  interests: z.array(z.string()).describe('List of activities or interests requested, e.g. ["trekking", "cafes", "sightseeing"]'),
  travelStyle: z.string().describe('Travel style, e.g. Adventure, Relaxed, Cultural, Luxury, Budget, Balanced'),
  missingFields: z.array(z.string()).describe('List of critical missing details if any, e.g. ["budget", "duration"]'),
  analysisSummary: z.string().describe('Brief 1-sentence summary of the parsed user requirement'),
});

/**
 * Agent 1 — Requirement Analyzer Node
 * Parses natural text user prompts, extracts structured parameters, detects missing details,
 * and incorporates long-term user preferences from MongoDB state memory.
 */
export const requirementAgentNode = async (state) => {
  const { userRequest, userLongTermPreferences } = state;

  const apiKey = process.env.GEMINI_API_KEY;
  let structuredOutput = null;

  if (apiKey) {
    try {
      const llm = new ChatGoogleGenerativeAI({
        modelName: 'gemini-1.5-flash',
        apiKey,
        temperature: 0.2,
      });

      const structuredLlm = llm.withStructuredOutput(RequirementAnalysisSchema);

      const promptText = `
System Role: You are the Requirement Analyzer Agent in WanderWave's Agentic Trip Planning system.
Your job is to parse the user's natural language trip request into structured travel parameters.

User Raw Request: "${userRequest || 'Plan a 5 day trip to Manali from Delhi under 30000 for 2 people with trekking and cafes'}"

Long-term User Memory Preferences (Use if prompt doesn't specify otherwise):
- Default Travel Style: ${userLongTermPreferences?.travelStyle || 'Balanced'}
- Default Dietary: ${userLongTermPreferences?.dietary || 'None'}
- Default Interests: ${JSON.stringify(userLongTermPreferences?.interests || ['Sightseeing'])}

Instructions:
1. Extract destination, starting city, duration in days, budget as integer number, travelers count, interests array, and travel style.
2. If budget is mentioned like "30k", convert it to numeric 30000.
3. If critical information (like destination) is missing, list it in missingFields.
4. Provide a clear 1-sentence analysis summary.
      `;

      structuredOutput = await structuredLlm.invoke(promptText);
    } catch (err) {
      console.warn('[RequirementAgent Notice] Gemini API call failed or key missing. Falling back to rule-based parser:', err.message);
    }
  }

  // Rule-based fallback parsing if Gemini API key is not set or API call fails
  if (!structuredOutput) {
    structuredOutput = parseRuleBased(userRequest, userLongTermPreferences);
  }

  // Merge extracted values with state
  const destination = structuredOutput.destination || state.destination || 'Manali';
  const startingCity = structuredOutput.startingCity || state.startingCity || 'Delhi';
  const duration = structuredOutput.duration || state.duration || 5;
  const budget = structuredOutput.budget || state.budget || 30000;
  const travelers = structuredOutput.travelers || state.travelers || 2;
  const interests = structuredOutput.interests?.length ? structuredOutput.interests : (state.interests?.length ? state.interests : ['Trekking', 'Cafes', 'Sightseeing']);
  const travelStyle = structuredOutput.travelStyle || userLongTermPreferences?.travelStyle || 'Adventure';

  const logEntry = {
    agent: 'Requirement Analyzer Agent',
    status: 'SUCCESS',
    timestamp: new Date().toLocaleTimeString(),
    details: `Parsed requirement for ${destination} (${duration} days, ₹${budget.toLocaleString()}, ${travelers} travelers).`,
  };

  return {
    destination,
    startingCity,
    duration,
    budget,
    travelers,
    interests,
    travelStyle,
    missingFields: structuredOutput.missingFields || [],
    agentLogs: [logEntry],
  };
};

/**
 * Fallback regex & string parser for offline / keyless demonstration
 */
function parseRuleBased(requestText = '', prefs = {}) {
  const text = requestText.toLowerCase();

  // Destination matching
  let destination = 'Manali';
  if (text.includes('goa')) destination = 'Goa';
  else if (text.includes('ladakh') || text.includes('leh')) destination = 'Ladakh';
  else if (text.includes('kerala')) destination = 'Kerala';
  else if (text.includes('jaipur') || text.includes('rajasthan')) destination = 'Jaipur';
  else if (text.includes('manali')) destination = 'Manali';

  // Days matching
  let duration = 5;
  const dayMatch = text.match(/(\d+)\s*(day|days)/);
  if (dayMatch) duration = parseInt(dayMatch[1], 10);

  // Budget matching (e.g. 30k, 30000, ₹30,000)
  let budget = 30000;
  const kMatch = text.match(/(\d+)\s*k/);
  const numMatch = text.match(/(\d{4,6})/);
  if (kMatch) budget = parseInt(kMatch[1], 10) * 1000;
  else if (numMatch) budget = parseInt(numMatch[1], 10);

  // Travelers matching
  let travelers = 2;
  const peopleMatch = text.match(/(\d+)\s*(people|person|traveler|travelers|friends)/);
  if (peopleMatch) travelers = parseInt(peopleMatch[1], 10);

  // Interests matching
  const interests = [];
  if (text.includes('trek') || text.includes('trekking')) interests.push('Trekking');
  if (text.includes('cafe') || text.includes('cafes') || text.includes('food')) interests.push('Cafes');
  if (text.includes('sightseeing') || text.includes('temple')) interests.push('Sightseeing');
  if (text.includes('beach') || text.includes('sea')) interests.push('Beaches');
  if (text.includes('adventure')) interests.push('Adventure Sports');
  if (!interests.length) interests.push('Trekking', 'Cafes', 'Sightseeing');

  return {
    destination,
    startingCity: 'Delhi',
    duration,
    budget,
    travelers,
    interests,
    travelStyle: prefs?.travelStyle || 'Adventure',
    missingFields: [],
    analysisSummary: `Parsed request for ${destination}: ${duration} days, ₹${budget} budget, ${travelers} travelers.`,
  };
}
