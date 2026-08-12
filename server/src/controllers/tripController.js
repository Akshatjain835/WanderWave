import axios from 'axios';
import { runRequirementAnalysis as runLocalRequirementAnalysis } from '../graph/workflow.js';

// @desc    Analyze & Plan user trip request using Python LangGraph AI-Service / Gemini LLM
// @route   POST /api/trips/analyze
// @access  Private
export const analyzeTripRequest = async (req, res) => {
  try {
    const { prompt, destination, startingCity, duration, budget, travelers, interests, travelStyle } = req.body;

    let userPrompt = prompt;
    if (!userPrompt && destination) {
      userPrompt = `Plan a ${duration || 5} day trip to ${destination} from ${startingCity || 'Delhi'} under ${budget || 30000} for ${travelers || 2} people with interests in ${(interests || []).join(', ')}`;
    }

    const userLongTermPrefs = req.user?.preferences || {
      travelStyle: travelStyle || 'Adventure',
      dietary: 'Vegetarian',
    };

    let resultData = null;

    // Try calling Python FastAPI ai-service running on http://localhost:8000
    try {
      const pythonResponse = await axios.post('http://localhost:8000/api/graph/analyze', {
        prompt: userPrompt,
        destination,
        startingCity,
        duration: Number(duration),
        budget: Number(budget),
        travelers: Number(travelers),
        interests,
        travelStyle,
        userLongTermPreferences: userLongTermPrefs,
      }, { timeout: 120000 });

      if (pythonResponse.data && pythonResponse.data.data) {
        resultData = pythonResponse.data.data;
      }
    } catch (pyErr) {
      console.warn('[TripController Notice] Python AI-Service offline at :8000, using local LangGraph engine:', pyErr.message);
    }

    // Fallback to local LangGraph engine if Python service is offline
    if (!resultData) {
      const localState = await runLocalRequirementAnalysis(userPrompt, userLongTermPrefs, {
        destination,
        startingCity,
        duration: Number(duration),
        budget: Number(budget),
        travelers: Number(travelers),
        travelStyle,
      });
      resultData = {
        destination: localState.destination,
        startingCity: localState.startingCity,
        duration: localState.duration,
        budget: localState.budget,
        travelers: localState.travelers,
        interests: localState.interests,
        travelStyle: localState.travelStyle,
        missingFields: localState.missingFields,
        userLongTermPreferences: localState.userLongTermPreferences,
        weatherForecast: localState.weatherForecast,
        transportOptions: localState.transportOptions,
        placesFound: localState.placesFound,
        budgetBreakdown: localState.budgetBreakdown,
        itinerary: localState.itinerary,
        agentLogs: localState.agentLogs,
      };
    }

    res.status(200).json({
      success: true,
      message: 'Trip requirement analyzed and planned by LangGraph Agents 🧠',
      data: resultData,
    });
  } catch (error) {
    console.error('[Analyze Trip Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error analyzing trip request',
    });
  }
};
