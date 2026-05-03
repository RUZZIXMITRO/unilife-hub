from fastapi import APIRouter, HTTPException
from datetime import datetime
from bson import ObjectId
from app.models import ChatRequest, ChatResponse
from app.database import get_db
from app.ai_service import get_ai_response

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Endpoint principal du chat IA.
    
    Flux :
    1. Recuperer ou creer la conversation en MongoDB
    2. Recuperer les produits depuis CatalogService
    3. Appeler Claude API avec le contexte
    4. Sauvegarder la conversation en MongoDB
    5. Retourner la reponse
    """
    db = get_db()

    # Recuperer ou creer la conversation
    conversation_id = request.conversation_id
    conversation_history = []

    if conversation_id:
        try:
            conv = await db.conversations.find_one({"_id": ObjectId(conversation_id)})
            if conv:
                conversation_history = conv.get("messages", [])
        except Exception:
            conversation_id = None

    # Appeler l IA
    try:
        ai_response = await get_ai_response(
            user_message=request.message,
            conversation_history=conversation_history,
            user_id=request.user_id
         )
    except Exception as e:
        print(f"ERREUR IA DETAIL: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erreur IA : {str(e)}")

    # Sauvegarder la conversation en MongoDB
    new_messages = conversation_history + [
        {"role": "user", "content": request.message, "timestamp": datetime.utcnow()},
        {"role": "assistant", "content": ai_response, "timestamp": datetime.utcnow()}
    ]

    if conversation_id:
        await db.conversations.update_one(
            {"_id": ObjectId(conversation_id)},
            {"$set": {"messages": new_messages, "updated_at": datetime.utcnow()}}
        )
    else:
        result = await db.conversations.insert_one({
            "user_id": request.user_id,
            "messages": new_messages,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
        conversation_id = str(result.inserted_id)

    # Suggestions de suivi
    suggestions = generate_suggestions(ai_response)

    return ChatResponse(
        response=ai_response,
        conversation_id=conversation_id,
        suggestions=suggestions
    )

@router.get("/conversations/{user_id}")
async def get_conversations(user_id: str):
    """Recuperer l historique des conversations d un utilisateur."""
    db = get_db()
    conversations = await db.conversations.find(
        {"user_id": user_id}
    ).sort("updated_at", -1).limit(10).to_list(10)

    for conv in conversations:
        conv["_id"] = str(conv["_id"])

    return {"success": True, "data": conversations}

@router.get("/conversation/{conversation_id}")
async def get_conversation(conversation_id: str):
    """Recuperer une conversation specifique."""
    db = get_db()
    try:
        conv = await db.conversations.find_one({"_id": ObjectId(conversation_id)})
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation introuvable")
        conv["_id"] = str(conv["_id"])
        return {"success": True, "data": conv}
    except Exception:
        raise HTTPException(status_code=400, detail="ID conversation invalide")

@router.delete("/conversation/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """Supprimer une conversation."""
    db = get_db()
    try:
        result = await db.conversations.delete_one({"_id": ObjectId(conversation_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Conversation introuvable")
        return {"success": True, "message": "Conversation supprimee"}
    except Exception:
        raise HTTPException(status_code=400, detail="ID invalide")

def generate_suggestions(response: str) -> list:
    return [
        "Y a-t-il une promotion disponible ?",
        "Comment passer une commande ?",
        "Comment ajouter au panier ?"
    ]

    return suggestions[:3]