from __future__ import annotations

from app.services.scoring_services import compute_interest_vector, compute_personality_vector


def _norm4(x: int) -> int:
    """Map 0-3 answer to 1-5 score."""
    return max(1, min(5, round(1 + (x / 3) * 4)))


def _norm5(x: int) -> int:
    """Map 0-4 answer to 1-5 score."""
    return max(1, min(5, x + 1))


def _norm_slider(x: float) -> int:
    """Map 0-100 slider to 1-5 score."""
    return max(1, min(5, round(1 + (x / 100) * 4)))


def build_personality_vector(p) -> list[float]:
    """
    Convert 9 questionnaire personality answers to a 20-answer list (1-5 scale),
    then compute the 5-value personality vector used by the matching algorithm.
    """
    s1 = _norm4(3 - p.q1)     # Social energy (invert: 0=energized → 5)
    s2 = _norm4(p.q2)          # Decision making style
    s3 = _norm5(p.q3)          # Feedback comfort (0-4 scale)
    s4 = _norm_slider(p.q4)    # Planning style (slider)
    s5 = _norm4(p.q5)          # Under pressure
    s6 = _norm4(p.q6)          # Team frustrations
    s7 = _norm4(3 - p.q7)      # Communication sync (invert: 0=quick chats → 5)
    s8 = _norm4(p.q8)          # Natural role
    s9 = _norm4(p.q9)          # Handling mistakes

    # Expand to 20 answers grouped to produce 5 meaningful vector dimensions:
    # Dim 1 (social/energy): s1, s1, s2, s3
    # Dim 2 (planning/pressure): s3, s4, s4, s5
    # Dim 3 (team dynamics): s5, s6, s6, s7
    # Dim 4 (role/communication): s7, s8, s8, s9
    # Dim 5 (summary blend): s9, s1, s2, s4
    answers_20 = [
        s1, s1, s2, s3,
        s3, s4, s4, s5,
        s5, s6, s6, s7,
        s7, s8, s8, s9,
        s9, s1, s2, s4,
    ]
    return compute_personality_vector(answers_20)


def build_interest_vector(prefs) -> list[float]:
    """
    Convert selected skills and goals into a 16-answer interest list (1-5 scale),
    then compute the 8-value interest vector used by the matching algorithm.
    Categories: Technology, Academics, Sports, Arts, Social, Gaming, Leadership, Misc
    """
    all_sel = set((prefs.skills_offer or []) + (prefs.skills_seek or []) + (prefs.goals or []))

    def score(*keywords) -> int:
        return min(5, 1 + sum(2 for kw in keywords if any(kw.lower() in s.lower() for s in all_sel)))

    tech      = score('Web Dev', 'AI', 'ML', 'Mobile', 'Cloud', 'DevOps', 'Cyber', 'Data Science')
    academics = score('Research', 'Study', 'Paper')
    sports    = 2  # default neutral (not covered in questionnaire)
    arts      = score('UI', 'UX', 'Design', 'Content', 'Video', 'Game')
    social    = score('Social Impact', 'Study Partner', 'Marketing', 'Sales', 'Presentation')
    gaming    = score('Game Development', 'Game Dev')
    leadership = score('Startup', 'Hackathon', 'Leadership', 'Project Mgmt')
    misc       = score('Finance', 'Internship')

    # Each category gets 2 answers (pairs averaged later)
    answers_16 = [
        min(5, tech), max(1, tech - 1),
        min(5, academics), max(1, academics - 1),
        sports, max(1, sports - 1),
        min(5, arts), max(1, arts - 1),
        min(5, social), max(1, social - 1),
        min(5, gaming), max(1, gaming - 1),
        min(5, leadership), max(1, leadership - 1),
        min(5, misc), max(1, misc - 1),
    ]
    return compute_interest_vector(answers_16)


def submit_questionnaire(store, user_id: str, payload) -> dict | None:
    """
    Process and persist the full onboarding questionnaire for a user.
    Updates: name, profile fields, questionnaire data, personality + interest vectors.
    """
    user = store.collection('users').get_document(user_id)
    if not user:
        return None

    p = payload.profile
    pers = payload.personality
    prefs = payload.preferences

    # Update name from firstName/lastName
    if p.first_name or p.last_name:
        parts = [p.first_name or '', p.last_name or '']
        user['name'] = ' '.join(x for x in parts if x).strip() or user['name']

    # Update profile fields
    for field, value in {
        'college': p.college,
        'department': p.department,
        'year': p.year,
        'year_label': p.year_label,
        'github': p.github or '',
        'linkedin': p.linkedin or '',
        'bio': p.bio or user.get('bio', ''),
    }.items():
        if value is not None:
            user[field] = value

    if p.interests:
        user['interests'] = p.interests

    # Store raw questionnaire answers for display/editing later
    user['questionnaire'] = {
        'personality': {
            'q1': pers.q1, 'q2': pers.q2, 'q3': pers.q3,
            'q4': pers.q4, 'q5': pers.q5, 'q6': pers.q6,
            'q7': pers.q7, 'q8': pers.q8, 'q9': pers.q9,
        },
        'preferences': {
            'skills_offer': prefs.skills_offer,
            'skills_seek': prefs.skills_seek,
            'goals': prefs.goals,
            'availability_days': prefs.availability_days,
            'availability_hours': prefs.availability_hours,
            'project_tags': prefs.project_tags,
            'team_size': prefs.team_size,
            'weekly_commitment': prefs.weekly_commitment,
            'match_type': prefs.match_type,
        },
    }

    # Update preference fields on user document directly (for Settings page)
    user['skills_offer'] = prefs.skills_offer
    user['skills_seek'] = prefs.skills_seek
    user['goals'] = prefs.goals
    user['availability_days'] = prefs.availability_days
    user['availability_hours'] = prefs.availability_hours
    user['project_tags'] = prefs.project_tags
    user['team_size'] = prefs.team_size
    user['weekly_commitment'] = prefs.weekly_commitment
    user['match_type'] = prefs.match_type

    # Compute and store ML vectors
    user['personality_vector'] = build_personality_vector(pers)
    user['interest_vector'] = build_interest_vector(prefs)

    # Mark questionnaire as completed
    user['questionnaire_completed'] = True

    store.collection('users').save_document(user)

    return {
        'questionnaire_completed': True,
        'personality_vector': user['personality_vector'],
        'interest_vector': user['interest_vector'],
    }
