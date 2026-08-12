import axios from 'axios';
import Trip from '../models/Trip.js';
import { runRequirementAnalysis as runLocalRequirementAnalysis } from '../graph/workflow.js';

const MOCK_USER_ID = '650000000000000000000001';

// Helper to safely get user ObjectId string
const getUserId = (req) => {
  const uid = req.user?._id || req.user?.id;
  if (uid && String(uid).length === 24) {
    return String(uid);
  }
  return MOCK_USER_ID;
};

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
        requiresHumanInput: localState.requiresHumanInput || false,
        humanPromptOptions: localState.humanPromptOptions || [],
        clarificationPrompt: localState.clarificationPrompt || '',
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

// @desc    Resume interrupted trip request with Human-in-the-Loop decision (Day 8)
// @route   POST /api/trips/resume
// @access  Private
export const resumeTripRequest = async (req, res) => {
  try {
    const { user_decision, destination, budget, duration, travelers, startingCity, travelStyle } = req.body;

    let resultData = null;

    try {
      const pythonResponse = await axios.post('http://localhost:8000/api/graph/resume', {
        user_decision,
        destination,
        budget,
        duration,
        travelers,
        startingCity,
        travelStyle,
      }, { timeout: 120000 });

      if (pythonResponse.data && pythonResponse.data.data) {
        resultData = pythonResponse.data.data;
      }
    } catch (pyErr) {
      console.warn('[TripController Notice] Python AI-Service offline, executing local resume fallback:', pyErr.message);
    }

    if (!resultData) {
      const resumedPrompt = `Plan a ${duration || 5} day trip to ${destination || user_decision || 'Goa'} from ${startingCity || 'Delhi'} under ${budget || 30000} for ${travelers || 2} people`;
      const localState = await runLocalRequirementAnalysis(resumedPrompt, {}, {
        destination: destination || user_decision,
        budget: Number(budget || 30000),
        duration: Number(duration || 5),
        travelers: Number(travelers || 2),
        startingCity: startingCity || 'Delhi',
        travelStyle: travelStyle || 'Adventure',
      });

      resultData = {
        destination: localState.destination,
        startingCity: localState.startingCity,
        duration: localState.duration,
        budget: localState.budget,
        travelers: localState.travelers,
        interests: localState.interests,
        travelStyle: localState.travelStyle,
        requiresHumanInput: false,
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
      message: 'Graph execution resumed with human decision 🚀',
      data: resultData,
    });
  } catch (error) {
    console.error('[Resume Trip Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error resuming trip request',
    });
  }
};

// In-memory trips fallback store when MongoDB Atlas connection is offline
let inMemoryTrips = [];

// @desc    Save generated trip to MongoDB persistence (Day 9)
// @route   POST /api/trips
// @access  Private
export const saveTrip = async (req, res) => {
  try {
    const userId = getUserId(req);
    const {
      tripTitle,
      destination,
      startingCity,
      duration,
      budget,
      travelers,
      travelStyle,
      interests,
      budgetBreakdown,
      itinerary,
      weatherForecast,
    } = req.body;

    let newTrip = null;

    try {
      newTrip = await Trip.create({
        user: userId,
        tripTitle: tripTitle || itinerary?.trip_title || `${duration}-Day Trip to ${destination}`,
        destination,
        startingCity: startingCity || 'Delhi',
        duration: Number(duration) || 5,
        budget: Number(budget) || 30000,
        travelers: Number(travelers) || 2,
        travelStyle: travelStyle || 'Adventure',
        interests: interests || ['Sightseeing'],
        budgetBreakdown: budgetBreakdown || {},
        itinerary: itinerary || {},
        weatherForecast: weatherForecast || {},
        status: 'planned',
      });
    } catch (dbErr) {
      console.warn('[DB Notice] MongoDB query failed, using direct creation or in-memory fallback:', dbErr.message);
      newTrip = {
        _id: 'trip_' + Date.now(),
        user: userId,
        tripTitle: tripTitle || itinerary?.trip_title || `${duration}-Day Trip to ${destination}`,
        destination,
        startingCity: startingCity || 'Delhi',
        duration: Number(duration) || 5,
        budget: Number(budget) || 30000,
        travelers: Number(travelers) || 2,
        travelStyle: travelStyle || 'Adventure',
        interests: interests || ['Sightseeing'],
        budgetBreakdown: budgetBreakdown || {},
        itinerary: itinerary || {},
        weatherForecast: weatherForecast || {},
        status: 'planned',
        createdAt: new Date(),
      };
      inMemoryTrips.unshift(newTrip);
    }

    res.status(201).json({
      success: true,
      message: 'Trip saved successfully 💾',
      data: newTrip,
    });
  } catch (error) {
    console.error('[Save Trip Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error saving trip to database',
    });
  }
};

// @desc    Get all saved trips for logged-in user (Day 9)
// @route   GET /api/trips
// @access  Private
export const getUserTrips = async (req, res) => {
  try {
    const userId = getUserId(req);
    let trips = [];

    try {
      trips = await Trip.find({ user: userId }).sort({ createdAt: -1 });
    } catch (dbErr) {
      trips = inMemoryTrips.filter((t) => String(t.user) === String(userId));
    }

    res.status(200).json({
      success: true,
      count: trips.length,
      data: trips,
    });
  } catch (error) {
    console.error('[Get User Trips Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user trips',
    });
  }
};

// @desc    Get single trip details by ID (Day 9)
// @route   GET /api/trips/:id
// @access  Private
export const getTripById = async (req, res) => {
  try {
    const userId = getUserId(req);
    let trip = null;

    try {
      trip = await Trip.findOne({ _id: req.params.id, user: userId });
    } catch (dbErr) {
      trip = inMemoryTrips.find((t) => String(t._id) === String(req.params.id));
    }

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found or unauthorized',
      });
    }

    res.status(200).json({
      success: true,
      data: trip,
    });
  } catch (error) {
    console.error('[Get Trip By ID Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching trip details',
    });
  }
};

// @desc    Delete trip from MongoDB (Day 9)
// @route   DELETE /api/trips/:id
// @access  Private
export const deleteTrip = async (req, res) => {
  try {
    const userId = getUserId(req);
    let trip = null;

    try {
      trip = await Trip.findOneAndDelete({ _id: req.params.id, user: userId });
    } catch (dbErr) {
      inMemoryTrips = inMemoryTrips.filter((t) => String(t._id) !== String(req.params.id));
      trip = { _id: req.params.id };
    }

    res.status(200).json({
      success: true,
      message: 'Trip deleted successfully 🗑️',
      data: { id: req.params.id },
    });
  } catch (error) {
    console.error('[Delete Trip Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting trip',
    });
  }
};

// @desc    Update trip status (Day 9)
// @route   PATCH /api/trips/:id/status
// @access  Private
export const updateTripStatus = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { status } = req.body;
    let trip = null;

    try {
      trip = await Trip.findOneAndUpdate(
        { _id: req.params.id, user: userId },
        { status },
        { new: true, runValidators: true }
      );
    } catch (dbErr) {
      const idx = inMemoryTrips.findIndex((t) => String(t._id) === String(req.params.id));
      if (idx !== -1) {
        inMemoryTrips[idx].status = status;
        trip = inMemoryTrips[idx];
      }
    }

    res.status(200).json({
      success: true,
      message: `Trip status updated to ${status} 🔄`,
      data: trip || { id: req.params.id, status },
    });
  } catch (error) {
    console.error('[Update Trip Status Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating trip status',
    });
  }
};
