from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user_id, get_store
from app.models.schemas import (
    ForumBookmarkRequest,
    ForumCommentCreate,
    ForumFollowRequest,
    ForumReplyCreate,
    ForumThreadCreate,
    ThreadVoteRequest,
)
from app.services.forum_service import (
    add_comment,
    add_reply,
    create_thread,
    get_thread,
    list_categories,
    list_threads,
    toggle_bookmark,
    toggle_follow,
    vote_comment,
    vote_thread,
)

router = APIRouter(prefix='/api/forums', tags=['forums'])


@router.get('/categories')
def forum_categories(store=Depends(get_store)):
    return list_categories(store)


@router.get('/threads')
def forum_threads(store=Depends(get_store)):
    return list_threads(store)


@router.get('/threads/{thread_id}')
def forum_thread(thread_id: str, store=Depends(get_store)):
    thread = get_thread(store, thread_id)
    if thread is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Thread not found')
    return thread


@router.post('/threads')
def forum_create_thread(
    payload: ForumThreadCreate,
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    return create_thread(store, user_id, payload.model_dump())


@router.post('/threads/{thread_id}/vote')
def forum_vote_thread(
    thread_id: str,
    payload: ThreadVoteRequest,
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    thread = vote_thread(store, thread_id, user_id, payload.direction)
    if thread is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Thread not found')
    return thread


@router.post('/threads/{thread_id}/bookmark')
def forum_bookmark_thread(
    thread_id: str,
    payload: ForumBookmarkRequest,
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    thread = toggle_bookmark(store, thread_id, user_id, payload.bookmarked)
    if thread is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Thread not found')
    return thread


@router.post('/threads/{thread_id}/follow')
def forum_follow_thread(
    thread_id: str,
    payload: ForumFollowRequest,
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    thread = toggle_follow(store, thread_id, user_id, payload.following)
    if thread is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Thread not found')
    return thread


@router.post('/threads/{thread_id}/comments')
def forum_add_comment(
    thread_id: str,
    payload: ForumCommentCreate,
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    thread = add_comment(store, thread_id, user_id, payload.text)
    if thread is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Thread not found')
    return thread


@router.post('/threads/{thread_id}/comments/{comment_id}/vote')
def forum_vote_comment(
    thread_id: str,
    comment_id: str,
    payload: ThreadVoteRequest,
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    thread = vote_comment(store, thread_id, comment_id, user_id, payload.direction)
    if thread is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Comment not found')
    return thread


@router.post('/threads/{thread_id}/comments/{comment_id}/replies')
def forum_add_reply(
    thread_id: str,
    comment_id: str,
    payload: ForumReplyCreate,
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    thread = add_reply(store, thread_id, comment_id, user_id, payload.text)
    if thread is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Comment not found')
    return thread
