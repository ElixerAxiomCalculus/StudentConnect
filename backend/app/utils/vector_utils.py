import math

def cosine_similarity(vector_a , vector_b):
    if(len(vector_a) != len(vector_b)):
        raise ("The lenght of both the vectors should be same")
    
    #dot product
    dot_product = 0
    for i in range(len(vector_a)):
        dot_product+=vector_a[i]*vector_b[i]

    #vector_a and vector_b magnitude
    sqauresSum_a = 0
    for value in vector_a:
        sqauresSum_a += value*value
    magnitude_a = math.sqrt(sqauresSum_a)


    sqauresSum_b = 0
    for value in vector_b:
        sqauresSum_b += value*value
    magnitude_b = math.sqrt(sqauresSum_b)

    #edge case
    if (magnitude_a == 0 or magnitude_b == 0):
        return 0
    
    #cosine function

    similarity = dot_product / (magnitude_a*magnitude_b)

    return similarity