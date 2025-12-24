import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// This component handles the /share/product/:id route
// It immediately redirects to the actual product page
// The edge function handles the OG meta for social crawlers
const ShareRedirect = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      // Redirect to the actual product page
      navigate(`/product/${id}`, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [id, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );
};

export default ShareRedirect;
