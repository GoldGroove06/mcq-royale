import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';


function AuthChecker({ children }) {
    const [auth, setAuth] = useState(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('http://localhost:3000/auth-check', {
          credentials: 'include', // send cookies
        });

        if (res.ok) {
          setAuth(true);
        } else {
          setAuth(false);
        }
      } catch (error) {
        setAuth(false);
      }
    }

    checkAuth();
  }, []);

  if (auth === null) return <p>Loading...</p>;
  if (auth === false) return <Navigate to="/signup" replace />;

  return children;
}


export default AuthChecker;