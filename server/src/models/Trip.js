import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tripTitle: {
      type: String,
      required: true,
      default: 'WanderWave AI Custom Trip',
    },
    destination: {
      type: String,
      required: true,
    },
    startingCity: {
      type: String,
      default: 'Delhi',
    },
    duration: {
      type: Number,
      required: true,
      default: 5,
    },
    budget: {
      type: Number,
      required: true,
      default: 30000,
    },
    travelers: {
      type: Number,
      default: 2,
    },
    travelStyle: {
      type: String,
      default: 'Adventure',
    },
    interests: [
      {
        type: String,
      },
    ],
    budgetBreakdown: {
      accommodation_stay: { type: Number, default: 0 },
      transportation: { type: Number, default: 0 },
      food_and_meals: { type: Number, default: 0 },
      activities_and_sightseeing: { type: Number, default: 0 },
      emergency_cushion: { type: Number, default: 0 },
      total_budget: { type: Number, default: 0 },
    },
    itinerary: {
      trip_title: String,
      destination: String,
      starting_city: String,
      duration_days: Number,
      travelers_count: Number,
      total_budget_cap_inr: Number,
      estimated_total_cost_inr: Number,
      days: [
        {
          day_number: Number,
          title: String,
          weather_snippet: String,
          morning: {
            time: String,
            activity: String,
            location: String,
            estimated_cost_inr: Number,
            tips: String,
          },
          afternoon: {
            time: String,
            activity: String,
            location: String,
            estimated_cost_inr: Number,
            tips: String,
          },
          evening: {
            time: String,
            activity: String,
            location: String,
            estimated_cost_inr: Number,
            tips: String,
          },
          estimated_day_cost_inr: Number,
        },
      ],
    },
    weatherForecast: {
      destination: String,
      forecast_days: [
        {
          day: Number,
          condition: String,
          temp_max_c: Number,
          temp_min_c: Number,
        },
      ],
    },
    status: {
      type: String,
      enum: ['planned', 'ongoing', 'completed'],
      default: 'planned',
    },
  },
  {
    timestamps: true,
  }
);

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;
