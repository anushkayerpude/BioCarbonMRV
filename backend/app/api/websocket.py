import logging
import asyncio
from typing import List, Set, Dict, Any
from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger("websocket_manager")

class ConnectionManager:
    """
    Manages active WebSocket connections for live telemetry broadcast.
    """
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"WebSocket client connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        logger.info(f"WebSocket client disconnected. Total clients: {len(self.active_connections)}")

    async def broadcast(self, message: Dict[str, Any]):
        if not self.active_connections:
            return

        disconnected: List[WebSocket] = []
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.warning(f"Failed to send message to WebSocket client: {e}")
                disconnected.append(connection)

        for connection in disconnected:
            self.disconnect(connection)

ws_manager = ConnectionManager()
