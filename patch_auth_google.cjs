const fs = require('fs');

const registerCode = `import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

export function Register() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        const now = Date.now();
        await setDoc(docRef, {
          id: user.uid,
          firstName: user.displayName?.split(' ')[0] || 'Utilisateur',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          email: user.email,
          phone: '',
          country: '',
          city: '',
          role: 'MEMBER', // I can inject ADMIN later if needed
          status: 'ACTIVE',
          createdAt: now,
          updatedAt: now,
          lastLoginAt: now
        });
      }

      navigate('/hub/dashboard');
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      setError(\`Erreur de connexion: \${err.message}\`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold font-heading text-[#6B3E1E]">Rejoignez le réseau FAFE</h2>
          <p className="mt-2 text-[#6B3E1E]/80">
            Connectez-vous à un réseau panafricain de femmes entrepreneures.
          </p>
        </div>
        
        <Card className="border border-[#6B3E1E]/5 shadow-xl rounded-2xl bg-white">
          <CardContent className="p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm font-medium mb-6">
                {error}
              </div>
            )}
            
            <Button 
              onClick={handleGoogleSignIn} 
              className="w-full bg-white border-2 border-stone-200 text-stone-700 hover:bg-stone-50 py-6 rounded-xl font-bold shadow-sm flex items-center justify-center gap-3" 
              disabled={isLoading}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {isLoading ? 'Connexion...' : 'S\\'inscrire avec Google'}
            </Button>
            
            <div className="mt-6 text-center text-sm text-[#6B3E1E]/70 border-t border-[#6B3E1E]/10 pt-6">
              Déjà membre ?{' '}
              <Link to="/hub/connexion" className="font-bold text-[#E67E22] hover:underline">
                Se connecter
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
`;

const loginCode = `import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

export function Login() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists, if not create basic profile
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        const now = Date.now();
        await setDoc(docRef, {
          id: user.uid,
          firstName: user.displayName?.split(' ')[0] || 'Utilisateur',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          email: user.email,
          phone: '',
          country: '',
          city: '',
          role: 'MEMBER',
          status: 'ACTIVE',
          createdAt: now,
          updatedAt: now,
          lastLoginAt: now
        });
      }

      navigate('/hub/dashboard');
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      setError(\`Erreur de connexion: \${err.message}\`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold font-heading text-[#6B3E1E]">Bon retour !</h2>
          <p className="mt-2 text-[#6B3E1E]/80">
            Connectez-vous à votre espace membre.
          </p>
        </div>
        
        <Card className="border border-[#6B3E1E]/5 shadow-xl rounded-2xl bg-white">
          <CardContent className="p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm font-medium mb-6">
                {error}
              </div>
            )}
            
            <Button 
              onClick={handleGoogleSignIn} 
              className="w-full bg-white border-2 border-stone-200 text-stone-700 hover:bg-stone-50 py-6 rounded-xl font-bold shadow-sm flex items-center justify-center gap-3" 
              disabled={isLoading}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {isLoading ? 'Connexion...' : 'Se connecter avec Google'}
            </Button>
            
            <div className="mt-6 text-center text-sm text-[#6B3E1E]/70 border-t border-[#6B3E1E]/10 pt-6">
              Pas encore membre ?{' '}
              <Link to="/hub/inscription" className="font-bold text-[#E67E22] hover:underline">
                S'inscrire
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/pages/auth/Register.tsx', registerCode);
fs.writeFileSync('src/pages/auth/Login.tsx', loginCode);

