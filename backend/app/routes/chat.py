from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status

from app.core.dependencies import get_chat_manager, get_current_user_id, get_store
from app.models.schemas import ChatThreadCreate, ChatThreadUpdate, MessageCreate
from app.services.chat_service import (
    create_thread,
    get_messages,
    list_threads,
    mark_thread_read,
    send_message,
    update_thread_preferences,
)

router = APIRouter(prefix='/api/chat', tags=['chat'])
ws_router = APIRouter(tags=['chat-ws'])


@router.get('/threads')
def chat_threads(
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    return list_threads(store, user_id)


@router.post('/threads')
def chat_thread_create(
    payload: ChatThreadCreate,
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    return create_thread(store, user_id, payload.model_dump())


@router.patch('/threads/{thread_id}')
def chat_thread_update(
    thread_id: str,
    payload: ChatThreadUpdate,
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    thread = update_thread_preferences(store, thread_id, user_id, payload.model_dump(exclude_none=True))
    if thread is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Thread not found')
    return thread


@router.get('/threads/{thread_id}/messages')
def chat_messages(
    thread_id: str,
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    messages = get_messages(store, thread_id, user_id)
    if messages is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Thread not found')
    return messages


@router.post('/threads/{thread_id}/messages')
async def chat_send_message(
    thread_id: str,
    payload: MessageCreate,
    store=Depends(get_store),
    manager=Depends(get_chat_manager),
    user_id: str = Depends(get_current_user_id),
):
    message = send_message(store, thread_id, user_id, payload.model_dump())
    if message is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Thread not found')
    await manager.broadcast(thread_id, {'type': 'message_created', 'payload': message})
    return message


@router.post('/threads/{thread_id}/read')
def chat_mark_read(
    thread_id: str,
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    thread = mark_thread_read(store, thread_id, user_id)
    if thread is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Thread not found')
    return {'ok': True}


@ws_router.websocket('/ws/chat/{thread_id}')
async def chat_ws(
    websocket: WebSocket,
    thread_id: str,
    store=Depends(get_store),
    manager=Depends(get_chat_manager),
):
    user_id = websocket.query_params.get('user_id')
    if not user_id:
        await websocket.close(code=1008)
        return
    if not list(filter(lambda thread: thread['threadId'] == thread_id, list_threads(store, user_id))):
        await websocket.close(code=1008)
        return

    await manager.connect(thread_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(thread_id, websocket)
