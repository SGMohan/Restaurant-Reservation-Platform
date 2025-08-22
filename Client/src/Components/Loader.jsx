import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';

const Loader = () => {
    const navigate = useNavigate();
    const { nextUrl } = useParams();
    
    useEffect(() => {
        if (nextUrl) {
            setTimeout(() => {
                navigate(`/${nextUrl}`);
            }, 8000);
        }
    }, [nextUrl, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

export default Loader
