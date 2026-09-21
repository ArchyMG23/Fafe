import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash && hash.length > 1) {
      const timeout = setTimeout(() => {
        try {
          const id = hash.replace(/^#/, '');
          const element = document.getElementById(id) || (hash.match(/^[#a-zA-Z0-9_-]+$/) ? document.querySelector(hash) : null);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        } catch (e) {
          // Gracefully ignore selector errors
        }
      }, 100);
      return () => clearTimeout(timeout);
    }

    try {
      window.scrollTo(0, 0);
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    } catch (e) {}
  }, [pathname, hash]);

  return null;
}

