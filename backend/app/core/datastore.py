from __future__ import annotations

from copy import deepcopy
from threading import Lock
from typing import Any

from pymongo import MongoClient


class InMemoryCollection:
    def __init__(self, initial_documents: list[dict[str, Any]] | None = None) -> None:
        self._lock = Lock()
        self._documents = {
            document['_id']: deepcopy(document)
            for document in (initial_documents or [])
        }

    def list_documents(self) -> list[dict[str, Any]]:
        with self._lock:
            return deepcopy(list(self._documents.values()))

    def get_document(self, document_id: str) -> dict[str, Any] | None:
        with self._lock:
            document = self._documents.get(document_id)
            return deepcopy(document) if document else None

    def save_document(self, document: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            cloned = deepcopy(document)
            self._documents[cloned['_id']] = cloned
            return deepcopy(cloned)

    def find_by_field(self, field: str, value: Any) -> dict[str, Any] | None:
        with self._lock:
            for doc in self._documents.values():
                if doc.get(field) == value:
                    return deepcopy(doc)
            return None

    def delete_document(self, document_id: str) -> None:
        with self._lock:
            self._documents.pop(document_id, None)

    def clear(self) -> None:
        with self._lock:
            self._documents.clear()


class MongoCollection:
    def __init__(self, collection) -> None:
        self._collection = collection

    def list_documents(self) -> list[dict[str, Any]]:
        return [deepcopy(document) for document in self._collection.find({})]

    def get_document(self, document_id: str) -> dict[str, Any] | None:
        document = self._collection.find_one({'_id': document_id})
        return deepcopy(document) if document else None

    def save_document(self, document: dict[str, Any]) -> dict[str, Any]:
        cloned = deepcopy(document)
        self._collection.replace_one({'_id': cloned['_id']}, cloned, upsert=True)
        return cloned

    def find_by_field(self, field: str, value: Any) -> dict[str, Any] | None:
        document = self._collection.find_one({field: value})
        return deepcopy(document) if document else None

    def delete_document(self, document_id: str) -> None:
        self._collection.delete_one({'_id': document_id})

    def clear(self) -> None:
        self._collection.delete_many({})


class InMemoryStore:
    kind = 'memory'

    def __init__(self, seed_collections: dict[str, list[dict[str, Any]]] | None = None) -> None:
        self._collections = {
            name: InMemoryCollection(documents)
            for name, documents in (seed_collections or {}).items()
        }

    def collection(self, name: str) -> InMemoryCollection:
        if name not in self._collections:
            self._collections[name] = InMemoryCollection()
        return self._collections[name]

    def close(self) -> None:
        return None


class MongoStore:
    kind = 'mongo'

    def __init__(self, mongo_url: str, database_name: str) -> None:
        self._client = MongoClient(mongo_url)
        self._db = self._client[database_name]
        self._collections: dict[str, MongoCollection] = {}

    def collection(self, name: str) -> MongoCollection:
        if name not in self._collections:
            self._collections[name] = MongoCollection(self._db[name])
        return self._collections[name]

    def close(self) -> None:
        self._client.close()
