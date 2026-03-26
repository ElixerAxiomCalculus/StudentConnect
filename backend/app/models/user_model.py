class User:
    def __init__(
            self,
            name,
            personality_answers,
            interest_answers,
            personality_vector,
            interest_vector,
        ):
        self.name = name
        self.personality_answers = personality_answers
        self.interest_answers = interest_answers
        self.personality_vector = personality_vector
        self.interest_vector = interest_vector