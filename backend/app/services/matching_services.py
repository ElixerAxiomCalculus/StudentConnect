from app.utils.vector_utils import cosine_similarity

INTEREST_LABELS = [
    "Technology",
    "Academics",
    "Sports",
    "Arts",
    "Social Activities",
    "Gaming",
    "Leadership",
    "Adventure"
]

def compute_match(user1,user2):
    
    personality_similarity = cosine_similarity(user1.personality_vector , user2.personality_vector)
    interest_similarity = cosine_similarity(user1.interest_vector,user2.interest_vector)

    final_score = (0.55*interest_similarity) + (0.45*personality_similarity)

    percentage = final_score*100

    common_interests=[]
    for i in range(len(user1.interest_vector)):
        if (user1.interest_vector[i] > 0.6 
            and user2.interest_vector[i] > 0.6
        ):
            common_interests.append(INTEREST_LABELS[i])


    if percentage >= 85:
        category = "Strong Match"
    elif percentage >= 70:
        category = "Great Match"
    elif percentage >= 55:
        category = "Good Match"
    elif percentage >= 40:
        category = "Moderate Match"
    else:
        category = "Low Match"

    return {
        "User 1: ":user1.name,
        "User 2: ":user2.name,
        "personality_similarity": personality_similarity,
        "interest_similarity": interest_similarity,
        "final_score_percentage": percentage,
        "match_category":category,
        "common_interests":common_interests,
    }

def find_best_matches(current_user,all_user,top_n=3):
    matches=[]
    for user in all_user:
        if(user.name == current_user.name):
            continue
        else:
            result = compute_match(current_user,user)
            matches.append(result)
    matches.sort(
        key=lambda x:x["final_score_percentage"],
        reverse=True
    )
    return matches[:top_n]