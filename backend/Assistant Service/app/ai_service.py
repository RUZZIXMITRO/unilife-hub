from groq import Groq
from typing import List, Dict
from app.config import settings
import re

SYSTEM_PROMPT = """Tu es UniAssist, l'assistant IA intelligent de UniLife Hub pour les étudiants universitaires au Maroc.

## TON IDENTITÉ
- Tu t'appelles UniAssist par défaut
- Si l'étudiant te donne un surnom, retiens-le pour toute la conversation
- Tu es intelligent, sympathique et adapté à la culture universitaire marocaine

## LANGUE (STRICT)
- Réponds TOUJOURS dans la même langue que le message de l'étudiant
- Français → Français
- English → English
- العربية → العربية

## CE QUE TU PEUX FAIRE
1. Répondre à toutes les questions générales (programmation, maths, sciences, etc.)
2. Aider avec les études et les révisions
3. Donner des conseils pour les examens
4. Si l'étudiant mentionne un examen → donne des conseils de révision adaptés
5. Si l'étudiant veut créer un rappel → dis-lui d'aller dans la section Agenda de UniLife Hub
6. Répondre aux questions sur la vie étudiante

## RAPPELS EXAMENS
Si l'étudiant mentionne un examen, réponds avec :
- Un message d'encouragement
- 2-3 conseils de révision rapides
- Rappelle-lui d'ajouter l'examen dans son Agenda UniLife Hub

## RÈGLES
- Maximum 3-4 phrases par réponse
- Sois concis et direct
- Ne jamais inventer des informations fausses
- Pour les rappels de tâches → rediriger vers l'Agenda UniLife Hub"""


async def get_ai_response(
    user_message: str,
    conversation_history: List[Dict],
    user_id: str
) -> tuple[str, str]:
    client = Groq(api_key=settings.groq_api_key)

    intent = detect_intent(user_message)

    assistant_name = extract_assistant_name(conversation_history)
    name_note = f"\n⚠️ TON NOM DANS CETTE CONVERSATION EST : {assistant_name}" if assistant_name else ""

    system_with_context = f"""{SYSTEM_PROMPT}{name_note}

LANGUE : Réponds dans la même langue que le dernier message."""

    messages = [{"role": "system", "content": system_with_context}]

    for msg in conversation_history[-20:]:
        content = msg["content"]
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
        max_tokens=300,
        temperature=0.2
    )

    return response.choices[0].message.content, intent


def detect_intent(message: str) -> str:
    message_lower = message.lower()
    if any(w in message_lower for w in ["examen", "exam", "contrôle", "ds", "امتحان"]):
        return "exam_reminder"
    if any(w in message_lower for w in ["rappelle", "reminder", "tâche", "task", "todo", "ذكرني"]):
        return "create_task"
    if any(w in message_lower for w in ["cours", "course", "matière", "درس"]):
        return "course_info"
    return "general"


def extract_assistant_name(conversation_history: List[Dict]) -> str:
    name_triggers = [
        "appelle", "surnom", "ton nom", "call you", "name you",
        "nickname", "je te donne", "c'est", "your name", "appeler"
    ]
    for msg in conversation_history:
        if msg["role"] == "user":
            content = msg["content"]
            content = re.sub(r'\n\n\[RESPOND IN .* ONLY\]', '', content)
            content_lower = content.lower()
            if any(t in content_lower for t in name_triggers):
                match = re.search(
                    r'["\u201c\u201d\u2018\u2019\u00ab\u00bb"\'"](\w+)["\u201c\u201d\u2018\u2019\u00ab\u00bb"\'"]',
                    content
                )
                if match:
                    return match.group(1)
    return ""


def detect_language(message: str) -> str:
    arabic_chars = set('ابتثجحخدذرزسشصضطظعغفقكلمنهوي')
    if any(c in arabic_chars for c in message):
        return "RESPOND IN ARABIC ONLY"
    english_words = {
        "hello", "hi", "hey", "what", "how", "do", "you", "have",
        "is", "are", "can", "the", "a", "an", "i", "want", "need",
        "show", "me", "please", "thanks", "yes", "no", "ok", "my",
        "your", "name", "give", "call", "tell", "exam", "course"
    }
    words = set(message.lower().split())
    if words & english_words:
        return "RESPOND IN ENGLISH ONLY"
    return "RESPOND IN FRENCH ONLY"


def generate_suggestions(intent: str, response: str) -> list:
    if intent == "exam_reminder":
        return [
            "Comment bien réviser ?",
            "Ajouter dans mon Agenda",
            "Conseils anti-stress"
        ]
    if intent == "create_task":
        return [
            "Aller dans l'Agenda",
            "Comment créer une tâche ?",
            "Mes tâches du jour"
        ]
    if intent == "course_info":
        return [
            "Voir tous les cours",
            "Cours recommandés",
            "Comment s'inscrire ?"
        ]
    return [
        "Comment puis-je t'aider ?",
        "Conseils pour les examens",
        "Questions sur UniLife Hub"
    ]
