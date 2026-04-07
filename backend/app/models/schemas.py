from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, EmailStr


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class VerifyEmailRequest(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6)


class ResendOtpRequest(BaseModel):
    email: EmailStr


class UserProfileUpdate(BaseModel):
    name: str | None = None
    major: str | None = None
    semester: int | None = None
    bio: str | None = None
    avatar: str | None = None
    interests: list[str] | None = None
    github: str | None = None
    linkedin: str | None = None
    college: str | None = None
    department: str | None = None
    skills_offer: list[str] | None = None
    skills_seek: list[str] | None = None
    goals: list[str] | None = None
    availability_days: list[str] | None = None
    availability_hours: list[str] | None = None
    weekly_commitment: str | None = None
    match_type: str | None = None


class QuestionnaireProfile(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    college: str | None = None
    department: str | None = None
    year: int | None = None
    year_label: str | None = None
    github: str | None = None
    linkedin: str | None = None
    interests: list[str] | None = None
    bio: str | None = None


class QuestionnairePersonality(BaseModel):
    q1: int = 0
    q2: int = 0
    q3: int = 2
    q4: float = 40.0
    q5: int = 0
    q6: int = 0
    q7: int = 0
    q8: int = 0
    q9: int = 0


class QuestionnairePreferences(BaseModel):
    skills_offer: list[str] = Field(default_factory=list)
    skills_seek: list[str] = Field(default_factory=list)
    goals: list[str] = Field(default_factory=list)
    availability_days: list[str] = Field(default_factory=list)
    availability_hours: list[str] = Field(default_factory=list)
    project_tags: list[str] = Field(default_factory=list)
    team_size: str = '3–4'
    weekly_commitment: str = '6–8 hrs/week'
    match_type: str = 'Complementary Skills'


class QuestionnaireSubmit(BaseModel):
    profile: QuestionnaireProfile
    personality: QuestionnairePersonality
    preferences: QuestionnairePreferences


class NotificationSettingsUpdate(BaseModel):
    email: dict[str, bool] | None = None
    push: dict[str, bool] | None = None
    inApp: dict[str, bool] | None = None


class PrivacySettingsUpdate(BaseModel):
    profile_visible: bool | None = None
    allow_messages_from_anyone: bool | None = None
    allow_project_invites: bool | None = None


class AccessibilitySettingsUpdate(BaseModel):
    reduced_motion: bool | None = None
    high_contrast: bool | None = None
    text_scale: int | None = Field(default=None, ge=80, le=140)


class MatchQuestionnaireUpdate(BaseModel):
    personality_answers: list[int] = Field(min_length=20, max_length=20)
    interest_answers: list[int] = Field(min_length=16, max_length=16)


class MatchActionRequest(BaseModel):
    target_user_id: str
    action: Literal['like', 'pass', 'accept', 'decline']


class ChatThreadCreate(BaseModel):
    participant_ids: list[str] = Field(min_length=1)
    title: str | None = ''
    type: Literal['personal', 'project', 'request', 'group'] = 'personal'
    project_id: str | None = None
    group_id: str | None = None


class ChatThreadUpdate(BaseModel):
    pinned: bool | None = None
    muted: bool | None = None
    archived: bool | None = None


class MessageAttachment(BaseModel):
    name: str
    size: str
    type: Literal['image', 'file']
    preview: str | None = None


class MessageCreate(BaseModel):
    text: str = ''
    attachments: list[MessageAttachment] = Field(default_factory=list)


class ForumThreadCreate(BaseModel):
    title: str
    content: str = ''
    tags: list[str] = Field(default_factory=list)
    category_id: str


class ThreadVoteRequest(BaseModel):
    direction: Literal['up', 'down']


class ForumCommentCreate(BaseModel):
    text: str


class ForumReplyCreate(BaseModel):
    text: str


class ForumBookmarkRequest(BaseModel):
    bookmarked: bool | None = None


class ForumFollowRequest(BaseModel):
    following: bool | None = None


class ProjectCreate(BaseModel):
    title: str
    description: str = ''
    tags: list[str] = Field(default_factory=list)
    visibility: Literal['public', 'private'] = 'public'


class ProjectJoinRequest(BaseModel):
    project_id: str


class ProjectInviteRequest(BaseModel):
    user_id: str | None = None
    query: str | None = None


class TaskCreate(BaseModel):
    title: str
    description: str = ''
    assignee: str | None = None
    deadline: str | None = None
    status: Literal['todo', 'in-progress', 'done'] = 'todo'


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    assignee: str | None = None
    deadline: str | None = None
    status: Literal['todo', 'in-progress', 'done'] | None = None


class GroupCreate(BaseModel):
    name: str
    description: str = ''
    category: str = 'study'
    visibility: Literal['public', 'private'] = 'public'
    tags: list[str] = Field(default_factory=list)


class GroupInviteRequest(BaseModel):
    user_id: str
