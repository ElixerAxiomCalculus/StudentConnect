def compute_interest_vector(interest_answers):
    if(len(interest_answers)!=16):
        raise ValueError("Interest questionnaire must contain 16 answers.")
    
    interest_vector=[]

    for i in range(0,16,2):
        q1 = interest_answers[i]
        q2 = interest_answers[i+1]

        average_score = (q1+q2)/2

        normalized_score = (average_score-1)/4

        interest_vector.append(normalized_score)

    return interest_vector


def compute_personality_vector(personality_answers):
    if(len(personality_answers)!= 20):
        raise ValueError("Personality questionnaire must contain 20 answers")
    
    personality_vector=[]

    for i in range(0,20,4):
        q1 = personality_answers[i]
        q2 = personality_answers[i+1]
        q3 = personality_answers[i+2]
        q4 = personality_answers[i+3]

        average_score = (q1+q2+q3+q4)/4
        normalized_score = (average_score-1)/4

        personality_vector.append(normalized_score)
    return personality_vector