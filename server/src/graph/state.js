import { Annotation } from '@langchain/langgraph';

/**
 * TripStateAnnotation defines the centralized, stateful graph schema
 * passed between all specialized LangGraph agents in WanderWave.
 */
export const TripStateAnnotation = Annotation.Root({
  // User Input & Parsing State
  userId: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  userRequest: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  destination: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  startingCity: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => 'Delhi',
  }),
  duration: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => 3,
  }),
  budget: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => 20000,
  }),
  travelers: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => 2,
  }),
  interests: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  travelStyle: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => 'Balanced',
  }),
  missingFields: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),

  // Long-Term User Preferences Memory Injected
  userLongTermPreferences: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => ({}),
  }),

  // Research Outputs (Populated by Day 5 Agents)
  placesFound: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  weatherForecast: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => ({}),
  }),
  transportOptions: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),

  // Budget Allocation (Populated by Day 6 Agent)
  budgetBreakdown: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => ({}),
  }),
  totalEstimatedCost: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => 0,
  }),

  // Generated Plan & Loop Control (Populated by Day 7 & 8 Agents)
  itinerary: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => ({}),
  }),
  validationErrors: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  isValid: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => false,
  }),
  retryCount: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => 0,
  }),

  // Human-in-the-Loop Interruption State
  requiresHumanInput: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => false,
  }),
  humanPromptOptions: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  userDecision: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  
  // Execution Log Trace for UI Real-Time Tracker
  agentLogs: Annotation({
    reducer: (x, y) => (x || []).concat(y || []),
    default: () => [],
  }),
});
