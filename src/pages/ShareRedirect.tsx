import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

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
      <Helmet>
        <title>Redirecting… | Graphic Wala</title>
        <meta name="robots" content="noindex, nofollow" />
        {id && <link rel="canonical" href={`https://graphicwala.com/product/${id}`} />}
      </Helmet>
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );
};

export default ShareRedirect;
