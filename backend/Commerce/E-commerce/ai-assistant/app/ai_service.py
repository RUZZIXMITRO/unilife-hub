from groq import Groq
from typing import List, Dict
import re
from app.config import settings
from app.catalog_client import get_all_products, search_products, format_products_for_context

SYSTEM_PROMPT = """Tu es UniShop, l'assistant shopping de UniLife Hub.
Tu réponds UNIQUEMENT aux questions liées au e-commerce :
- Produits disponibles, prix, état, couleurs, tailles
- Panier, commandes, livraison
- Promotions et réductions
- Comment acheter, payer, retourner

Si la question n'est PAS liée au shopping → réponds :
"Je suis UniShop, je réponds uniquement aux questions de la boutique. Pour d'autres questions, utilisez l'Assistant IA général."

RÈGLES :
- ALWAYS reply in the SAME language as the user
- Maximum 2-3 phrases
- ONLY products from the catalogue
- NEVER mention technical IDs"""


async def get_ai_response(
    user_message: str,
    conversation_history: List[Dict],
    user_id: str
) -> str:
    client = Groq(api_key=settings.groq_api_key)

    products = await get_all_products()
    keywords = extract_keywords(user_message)
    if keywords:
        searched = await search_products(keywords)
        if searched:
            products = searched

    products_context = format_products_for_context(products)

    # Extraire le nom donné à l'assistant
    assistant_name = extract_assistant_name(conversation_history)
    name_note = f"\n⚠️ YOUR NAME IN THIS CONVERSATION IS: {assistant_name} — Use it when asked." if assistant_name else ""

    system_with_context = f"""{SYSTEM_PROMPT}{name_note}

CATALOGUE (ONLY THESE PRODUCTS EXIST):
{products_context}

DELIVERY: Always free on UniLife Hub.
LANGUAGE: Reply in the same language as the user's last message."""

    messages = [{"role": "system", "content": system_with_context}]

    # Inclure l'historique sans les hints de langue
    for msg in conversation_history[-20:]:
        content = msg["content"]
        # Nettoyer les hints de langue ajoutés précédemment
        content = re.sub(r'\n\n\[RESPOND IN .* ONLY\]', '', content)
        messages.append({"role": msg["role"], "content": content})

    lang_hint = detect_language(user_message)
    messages.append({
        "role": "user",
        "content": f"{user_message}\n\n[{lang_hint}]"
    })

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        max_tokens=250,
        temperature=0.1
    )

    return response.choices[0].message.content

def extract_assistant_name(conversation_history: List[Dict]) -> str:
    """Extrait le nom donné à l'assistant depuis l'historique."""
    name_triggers = [
        "appelle", "surnom", "ton nom", "call you", "name you",
        "nickname", "je te donne", "c'est", "your name"
    ]
    for msg in conversation_history:
        if msg["role"] == "user":
            content = msg["content"]
            content_lower = content.lower()
            if any(t in content_lower for t in name_triggers):
                # Chercher un mot entre guillemets
                match = re.search(r'["\u201c\u201d\u2018\u2019«»](\w+)["\u201c\u201d\u2018\u2019«»]', content)
                if match:
                    return match.group(1)
    return ""

def detect_language(message: str) -> str:
    arabic_chars = set('ابتثجحخدذرزسشصضطظعغفقكلمنهوي')
    if any(c in arabic_chars for c in message):
        return "RESPOND IN ARABIC ONLY"

    english_words = {"hello", "hi", "hey", "what", "how", "do", "you", "have",
                     "is", "are", "can", "the", "a", "an", "i", "want", "need",
                     "show", "me", "please", "thanks", "yes", "no", "ok", "my",
                     "your", "name", "give", "call", "tell", "color", "colour"}
    words = set(message.lower().split())
    if words & english_words:
        return "RESPOND IN ENGLISH ONLY"

    return "RESPOND IN FRENCH ONLY"

def extract_keywords(message: str) -> str:
    if len(message.split()) <= 2:
        return ""

    message_lower = message.lower()
    search_triggers = ["cherche", "trouve", "besoin", "veux", "looking",
                       "find", "need", "want", "show", "produit", "product",
                       "acheter", "buy", "prix", "price"]
    has_search_intent = any(t in message_lower for t in search_triggers)
    if has_search_intent:
        words = message.split()
        stop_words = {"je", "tu", "un", "une", "des", "le", "la", "les",
                      "cherche", "trouve", "besoin", "de", "du", "et", "pour",
                      "i", "the", "a", "an", "is", "are", "do", "you", "have",
                      "what", "how", "can", "please", "me", "show", "want", "need"}
        keywords = [w for w in words if w.lower() not in stop_words and len(w) > 2]
        return " ".join(keywords[:3])
    return ""