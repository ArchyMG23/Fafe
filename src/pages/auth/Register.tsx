import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';

export function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Cette adresse e-mail est déjà utilisée.';
      case 'auth/invalid-email':
        return 'Adresse e-mail invalide.';
      case 'auth/weak-password':
        return 'Le mot de passe doit comporter au moins 6 caractères.';
      case 'auth/network-request-failed':
        return 'Erreur réseau. Veuillez vérifier votre connexion.';
      default:
        return 'Une erreur est survenue lors de l\'inscription.';
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    setIsLoading(true);

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Create user profile in Firestore
      const now = Date.now();
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        city: formData.city,
        role: 'MEMBER',
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now
      });

      navigate('/dashboard');
    } catch (err: any) {
      setError(getErrorMessage(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold font-heading text-[#6B3E1E]">Rejoignez le réseau FAFE</h2>
          <p className="mt-2 text-[#6B3E1E]/80">
            Connectez-vous à un réseau panafricain de femmes entrepreneures.
          </p>
        </div>
        
        <Card className="border border-[#6B3E1E]/5 shadow-xl rounded-2xl bg-white">
          <CardContent className="p-8">
            <form onSubmit={handleRegister} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm font-medium">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#6B3E1E] mb-1">Prénom *</label>
                  <Input name="firstName" required value={formData.firstName} onChange={handleChange} className="focus:border-[#E67E22]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6B3E1E] mb-1">Nom *</label>
                  <Input name="lastName" required value={formData.lastName} onChange={handleChange} className="focus:border-[#E67E22]" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#6B3E1E] mb-1">Adresse e-mail *</label>
                <Input type="email" name="email" required value={formData.email} onChange={handleChange} className="focus:border-[#E67E22]" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#6B3E1E] mb-1">Téléphone *</label>
                <Input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="focus:border-[#E67E22]" placeholder="+225 00 00 00 00" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#6B3E1E] mb-1">Pays *</label>
                  <Input name="country" required value={formData.country} onChange={handleChange} className="focus:border-[#E67E22]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6B3E1E] mb-1">Ville *</label>
                  <Input name="city" required value={formData.city} onChange={handleChange} className="focus:border-[#E67E22]" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#6B3E1E] mb-1">Mot de passe *</label>
                  <Input type="password" name="password" required value={formData.password} onChange={handleChange} className="focus:border-[#E67E22]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6B3E1E] mb-1">Confirmer le mot de passe *</label>
                  <Input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} className="focus:border-[#E67E22]" />
                </div>
              </div>
              
              <Button type="submit" className="w-full bg-[#E67E22] hover:bg-[#c96a1a] text-white py-6 rounded-xl font-bold shadow-md" disabled={isLoading}>
                {isLoading ? 'Création en cours...' : 'Créer mon compte'}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm text-[#6B3E1E]/70 border-t border-[#6B3E1E]/10 pt-6">
              Déjà membre ?{' '}
              <Link to="/connexion" className="font-bold text-[#E67E22] hover:underline">
                Se connecter
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
