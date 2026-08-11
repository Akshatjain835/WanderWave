import os
from langchain_google_genai import ChatGoogleGenerativeAI

def get_llm(temperature: float = 0.3):
    """
    Returns a configured ChatGoogleGenerativeAI instance using GEMINI_API_KEY.
    Tries primary flash/pro models with fallback resilience.
    """
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return None

    # Supported model identifiers in order of preference
    candidate_models = ["gemini-1.5-flash", "gemini-2.0-flash-exp", "gemini-1.5-pro", "gemini-2.5-flash"]
    
    for model_name in candidate_models:
        try:
            llm = ChatGoogleGenerativeAI(
                model=model_name,
                google_api_key=api_key,
                temperature=temperature
            )
            return llm
        except Exception as e:
            print(f"[LLM Helper Notice] Could not initialize {model_name}: {e}")
            continue

    return None
