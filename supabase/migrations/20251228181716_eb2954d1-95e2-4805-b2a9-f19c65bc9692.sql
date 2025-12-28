-- Add database constraint for review comment length validation
ALTER TABLE public.reviews 
ADD CONSTRAINT reviews_comment_length_check 
CHECK (char_length(comment) >= 10 AND char_length(comment) <= 1000);