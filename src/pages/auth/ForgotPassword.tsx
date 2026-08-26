import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { CheckCircle2 } from 'lucide-react';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Aucun compte ne correspond à cette adresse e-mail.';
      case 'auth/invalid-email':
        return 'Adresse e-mail invalide.';
      case 'auth/network-request-failed':
        return 'Erreur réseau. Veuillez vérifier votre connexion.';
      default:
        return 'Une erreur est survenue. Veuillez réessayer.';
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setIsSuccess(true);
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
          <h2 className="text-3xl font-bold font-heading text-[#6B3E1E]">Mot de passe oublié</h2>
          <p className="mt-2 text-[#6B3E1E]/80">
            Entrez votre adresse e-mail pour réinitialiser votre mot de passe
          </p>
        </div>
        
        <Card className="border border-[#6B3E1E]/5 shadow-xl rounded-2xl bg-white">
          <CardContent className="p-8">
            {isSuccess ? (
              <div className="text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">E-mail envoyé</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Si un compte existe avec l'adresse <strong>{email}</strong>, un e-mail avec les instructions de réinitialisation vous a été envoyé.
                </p>
                <Link to="/hub/connexion">
                  <Button className="w-full bg-[#E67E22] hover:bg-[#c96a1a] text-white">
                    Retour à la connexion
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm font-medium">
                    {error}
                  </div>
                )}
                
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
                
                <Button type="submit" className="w-full bg-[#E67E22] hover:bg-[#c96a1a] text-white py-6 rounded-xl font-bold shadow-md" disabled={isLoading}>
                  {isLoading ? 'Envoi en cours...' : 'Envoyer les instructions'}
                </Button>
                
                <div className="mt-6 text-center text-sm text-[#6B3E1E]/70 border-t border-[#6B3E1E]/10 pt-6">
                  <Link to="/hub/connexion" className="font-bold text-[#E67E22] hover:underline">
                    Retour à la connexion
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
