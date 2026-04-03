def compute_interest_vector(interest_answers):
    if len(interest_answers) != 16:
        raise ValueError("Interest questionnaire must contain 16 answers.")

    interest_vector = []
    for i in range(0, 16, 2):
        average_score = (interest_answers[i] + interest_answers[i + 1]) / 2
        interest_vector.append((average_score - 1) / 4)

    return interest_vector


def compute_personality_vector(personality_answers):
    if len(personality_answers) != 20:
        raise ValueError("Personality questionnaire must contain 20 answers.")

    personality_vector = []
    for i in range(0, 20, 4):
        average_score = sum(personality_answers[i:i + 4]) / 4
        personality_vector.append((average_score - 1) / 4)

    return personality_vector
