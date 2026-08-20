import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Email ou mot de passe incorrect.';
      case 'auth/user-disabled':
        return 'Ce compte a été désactivé. Veuillez contacter le support.';
      case 'auth/too-many-requests':
        return 'Trop de tentatives échouées. Veuillez réessayer plus tard.';
      case 'auth/network-request-failed':
        return 'Erreur réseau. Veuillez vérifier votre connexion.';
      default:
        return 'Une erreur est survenue lors de la connexion.';
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login timestamp
      try {
        const userRef = doc(db, 'users', userCredential.user.uid);
        await updateDoc(userRef, {
          lastLoginAt: Date.now()
        });
      } catch (updateError) {
        console.error("Error updating lastLoginAt", updateError);
        // Continue login even if update fails
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(getErrorMessage(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold font-heading text-[#6B3E1E]">Heureuse de vous retrouver</h2>
          <p className="mt-2 text-[#6B3E1E]/80">
            Accédez à votre espace membre FAFE
          </p>
        </div>
        
        <Card className="border border-[#6B3E1E]/5 shadow-xl rounded-2xl bg-white">
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm font-medium">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6B3E1E] mb-1">
                    Adresse e-mail
                  </label>
                  <Input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="focus:border-[#E67E22]"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-[#6B3E1E]">
                      Mot de passe
                    </label>
                    <Link to="/mot-de-passe-oublie" className="text-xs font-medium text-[#E67E22] hover:underline">
                      Mot de passe oublié ?
                    </Link>
                  </div>
                  <Input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="focus:border-[#E67E22]"
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full bg-[#E67E22] hover:bg-[#c96a1a] text-white py-6 rounded-xl font-bold shadow-md" disabled={isLoading}>
                {isLoading ? 'Connexion en cours...' : 'Se connecter'}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm text-[#6B3E1E]/70 border-t border-[#6B3E1E]/10 pt-6">
              Pas encore membre ?{' '}
              <Link to="/inscription" className="font-bold text-[#E67E22] hover:underline">
                Créer un compte
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
