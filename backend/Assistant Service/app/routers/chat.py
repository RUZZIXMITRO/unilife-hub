from fastapi import APIRouter, HTTPException
from datetime import datetime
from bson import ObjectId
from app.models import ChatRequest, ChatResponse
from app.database import get_db
from app.ai_service import get_ai_response, generate_suggestions

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    db = get_db()

    conversation_id = request.conversation_id
    conversation_history = []

    if conversation_id:
        try:
            conv = await db.conversations.find_one({"_id": ObjectId(conversation_id)})
            if conv:
                conversation_history = conv.get("messages", [])
        except Exception:
            conversation_id = None

    try:
        ai_response, intent = await get_ai_response(
            user_message=request.message,
            conversation_history=conversation_history,
            user_id=request.user_id
        )
    except Exception as e:
        print(f"ERREUR IA: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erreur IA : {str(e)}")

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

    suggestions = generate_suggestions(intent, ai_response)

    return ChatResponse(
        response=ai_response,
        conversation_id=conversation_id,
        intent=intent,
        suggestions=suggestions
    )


@router.get("/conversations/{user_id}")
async def get_conversations(user_id: str):
    db = get_db()
    conversations = await db.conversations.find(
        {"user_id": user_id}
    ).sort("updated_at", -1).limit(10).to_list(10)
    for conv in conversations:
        conv["_id"] = str(conv["_id"])
    return {"success": True, "data": conversations}


@router.delete("/conversation/{conversation_id}")
async def delete_conversation(conversation_id: str):
    db = get_db()
    try:
        result = await db.conversations.delete_one({"_id": ObjectId(conversation_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Conversation introuvable")
        return {"success": True, "message": "Conversation supprimée"}
    except Exception:
        raise HTTPException(status_code=400, detail="ID invalide")
