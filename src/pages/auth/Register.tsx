import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { Eye, EyeOff, Check, X } from 'lucide-react';

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
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getErrorMessage = (err: any) => {
    const code = err.code || 'unknown';
    const msg = err.message || 'unknown';
    switch (code) {
      case 'auth/email-already-in-use': return 'Cette adresse e-mail est déjà utilisée.';
      case 'auth/invalid-email': return 'Adresse e-mail invalide.';
      case 'auth/weak-password': return 'Le mot de passe est trop faible.';
      case 'auth/operation-not-allowed': return "L'authentification par email n'est pas activée. Veuillez utiliser Google.";
      default: return `Erreur Firebase (${code}): ${msg}`;
    }
  };

  const constraints = [
    { label: 'Au moins 8 caractères', isValid: formData.password.length >= 8 },
    { label: 'Une lettre majuscule', isValid: /[A-Z]/.test(formData.password) },
    { label: 'Une lettre minuscule', isValid: /[a-z]/.test(formData.password) },
    { label: 'Un chiffre', isValid: /[0-9]/.test(formData.password) },
    { label: 'Un caractère spécial', isValid: /[^A-Za-z0-9]/.test(formData.password) }
  ];

  const isPasswordValid = constraints.every(c => c.isValid);

  const createUserDocument = async (user: any, additionalData: any) => {
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);

    const isSuperAdmin = user.email === 'yombivictor@gmail.com';

    if (!docSnap.exists()) {
      const now = Date.now();
      await setDoc(docRef, {
        id: user.uid,
        firstName: additionalData.firstName || user.displayName?.split(' ')[0] || (isSuperAdmin ? 'Super' : 'Utilisateur'),
        lastName: additionalData.lastName || user.displayName?.split(' ').slice(1).join(' ') || (isSuperAdmin ? 'Admin' : ''),
        email: user.email,
        phone: additionalData.phone || '',
        country: additionalData.country || 'Sénégal',
        city: additionalData.city || 'Dakar',
        role: isSuperAdmin ? 'SUPER_ADMIN' : 'MEMBER',
        membershipStatus: isSuperAdmin ? 'ACTIVE' : 'PENDING',
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now
      });
    } else if (isSuperAdmin && docSnap.data().role !== 'SUPER_ADMIN') {
      await setDoc(docRef, { role: 'SUPER_ADMIN', membershipStatus: 'ACTIVE', updatedAt: Date.now() }, { merge: true });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (!isPasswordValid) {
      setError('Veuillez respecter toutes les contraintes du mot de passe.');
      return;
    }

    setIsLoading(true);

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Create user profile in Firestore
      await createUserDocument(user, formData);

      navigate('/hub/dashboard');
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await createUserDocument(user, {});

      navigate('/hub/dashboard');
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      setError(`Erreur de connexion Google: ${err.message}`);
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
            <Button 
              type="button"
              onClick={handleGoogleSignIn} 
              className="w-full mb-6 bg-white border-2 border-stone-200 text-stone-700 hover:bg-stone-50 py-6 rounded-xl font-bold shadow-sm flex items-center justify-center gap-3" 
              disabled={isLoading}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              S'inscrire avec Google
            </Button>
            
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-stone-500">Ou inscrivez-vous avec votre e-mail</span>
              </div>
            </div>

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
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#6B3E1E] mb-1">Mot de passe *</label>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      name="password" 
                      required 
                      value={formData.password} 
                      onChange={handleChange} 
                      className="focus:border-[#E67E22] pr-10" 
                    />
                    <button 
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {formData.password && (
                  <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
                    <p className="text-sm font-bold text-stone-700 mb-2">Le mot de passe doit contenir :</p>
                    <ul className="space-y-1">
                      {constraints.map((c, i) => (
                        <li key={i} className="flex items-center text-sm">
                          {c.isValid ? (
                            <Check className="w-4 h-4 text-green-500 mr-2" />
                          ) : (
                            <X className="w-4 h-4 text-red-500 mr-2" />
                          )}
                          <span className={c.isValid ? "text-stone-600" : "text-stone-400"}>{c.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[#6B3E1E] mb-1">Confirmer le mot de passe *</label>
                  <div className="relative">
                    <Input 
                      type={showConfirmPassword ? "text" : "password"} 
                      name="confirmPassword" 
                      required 
                      value={formData.confirmPassword} 
                      onChange={handleChange} 
                      className="focus:border-[#E67E22] pr-10" 
                    />
                    <button 
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
              
              <Button type="submit" className="w-full bg-[#E67E22] hover:bg-[#c96a1a] text-white py-6 rounded-xl font-bold shadow-md" disabled={isLoading}>
                {isLoading ? 'Création en cours...' : 'Créer mon compte e-mail'}
              </Button>
            </form>
            
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
