from __future__ import annotations

from collections import defaultdict

from fastapi import WebSocket


class ChatConnectionManager:
    def __init__(self) -> None:
        self._connections: dict[str, list[WebSocket]] = defaultdict(list)

    async def connect(self, thread_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections[thread_id].append(websocket)

    def disconnect(self, thread_id: str, websocket: WebSocket) -> None:
        if thread_id not in self._connections:
            return
        if websocket in self._connections[thread_id]:
            self._connections[thread_id].remove(websocket)
        if not self._connections[thread_id]:
            self._connections.pop(thread_id, None)

    async def broadcast(self, thread_id: str, payload: dict) -> None:
        for websocket in list(self._connections.get(thread_id, [])):
            await websocket.send_json(payload)
