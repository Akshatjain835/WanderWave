import os
from langchain_google_genai import ChatGoogleGenerativeAI

def get_llm(temperature: float = 0.3, max_retries: int = 2, request_timeout: int = 20):
    """
    Returns a configured ChatGoogleGenerativeAI instance using GEMINI_API_KEY.
    Tries primary flash/pro models with fallback resilience across candidate versions.
    """
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return None

    # Supported active model identifiers in order of preference
    candidate_models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"]
    
    for model_name in candidate_models:
        try:
            llm = ChatGoogleGenerativeAI(
                model=model_name,
                google_api_key=api_key,
                temperature=temperature,
                max_retries=max_retries,
                request_timeout=request_timeout
            )
            return llm
        except Exception as e:
            print(f"[LLM Helper Notice] Could not initialize {model_name}: {e}")
            continue

    return None
