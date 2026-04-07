from __future__ import annotations

import resend
from app.core.config import get_settings


def send_otp_email(to_email: str, otp: str) -> bool:
    settings = get_settings()
    if not settings.resend_api_key:
        print(f'[DEV] OTP for {to_email}: {otp}')
        return True

    resend.api_key = settings.resend_api_key
    try:
        resend.Emails.send({
            'from': 'StudentConnect <official@theprojectpsi.com>',
            'to': [to_email],
            'subject': 'Your StudentConnect Verification Code',
            'html': f'''
                <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #fff;">
                    <h1 style="color: #d44332; font-size: 24px; margin-bottom: 8px;">StudentConnect</h1>
                    <p style="color: #333; font-size: 16px; margin-bottom: 24px;">Your verification code is:</p>
                    <div style="background: linear-gradient(135deg, #d44332, #3d5999); color: #fff; font-size: 36px; font-weight: 700; letter-spacing: 12px; text-align: center; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                        {otp}
                    </div>
                    <p style="color: #666; font-size: 14px;">This code expires in <strong>10 minutes</strong>.</p>
                    <p style="color: #999; font-size: 12px; margin-top: 32px;">If you didn't request this code, please ignore this email.</p>
                </div>
            ''',
        })
        return True
    except Exception as e:
        print(f'[EMAIL ERROR] Failed to send OTP to {to_email}: {e}')
        return False
