from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user_id, get_store
from app.models.schemas import RegisterRequest, LoginRequest, VerifyEmailRequest, ResendOtpRequest
from app.services.auth_service import (
    authenticate_user,
    create_access_token,
    generate_otp,
    mark_email_verified,
    register_user,
    store_otp,
    verify_otp,
)
from app.services.email_service import send_otp_email

router = APIRouter(prefix='/api/auth', tags=['auth'])


@router.post('/register')
def register(payload: RegisterRequest, store=Depends(get_store)):
    user = register_user(store, payload.name, payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail='An account with this email already exists',
        )

    # Generate and send OTP
    otp = generate_otp()
    store_otp(store, payload.email, otp)
    send_otp_email(payload.email, otp)

    return {
        'message': 'Account created. Please verify your email.',
        'email': payload.email,
        'requires_verification': True,
    }


@router.post('/verify-email')
def verify_email(payload: VerifyEmailRequest, store=Depends(get_store)):
    if not verify_otp(store, payload.email, payload.otp):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Invalid or expired OTP',
        )

    user = mark_email_verified(store, payload.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='User not found',
        )

    token = create_access_token(user['_id'], user['email'])
    return {
        'token': token,
        'user': {
            'id': user['_id'],
            'name': user['name'],
            'email': user['email'],
            'avatar': user['avatar'],
            'major': user.get('major', ''),
        },
    }


@router.post('/resend-otp')
def resend_otp(payload: ResendOtpRequest, store=Depends(get_store)):
    user = store.collection('users').find_by_field('email', payload.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='No account found with this email',
        )

    otp = generate_otp()
    store_otp(store, payload.email, otp)
    send_otp_email(payload.email, otp)

    return {'message': 'OTP resent', 'email': payload.email}


@router.post('/login')
def login(payload: LoginRequest, store=Depends(get_store)):
    user = authenticate_user(store, payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid email or password',
        )

    if not user.get('email_verified', False):
        # Resend OTP for unverified accounts
        otp = generate_otp()
        store_otp(store, payload.email, otp)
        send_otp_email(payload.email, otp)
        return {
            'message': 'Email not verified. A new OTP has been sent.',
            'email': payload.email,
            'requires_verification': True,
        }

    token = create_access_token(user['_id'], user['email'])
    return {
        'token': token,
        'user': {
            'id': user['_id'],
            'name': user['name'],
            'email': user['email'],
            'avatar': user['avatar'],
            'major': user.get('major', ''),
        },
    }


@router.get('/me')
def auth_me(
    store=Depends(get_store),
    user_id: str = Depends(get_current_user_id),
):
    user = store.collection('users').get_document(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid session',
        )
    return {
        'id': user['_id'],
        'name': user['name'],
        'email': user.get('email', ''),
        'avatar': user['avatar'],
        'major': user.get('major', ''),
    }
