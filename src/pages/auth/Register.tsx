import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { useAuthStore } from '../../store/auth';

export function Register() {
  const { currentUser, userProfile } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser && userProfile) {
      if (['SUPER_ADMIN', 'ADMIN'].includes(userProfile.role)) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/hub/dashboard', { replace: true });
      }
    }
  }, [currentUser, userProfile, navigate]);

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
    const isSuperAdmin = user.email === 'yombivictor@gmail.com';
    const now = Date.now();
    
    // Use merge:true so that if the auth.ts auto-repair already created the profile,
    // we simply merge the additional form fields (phone, country, city, etc.) into it.
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
      updatedAt: now,
      lastLoginAt: now
    }, { merge: true });
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
                {isLoading ? 'Création en cours...' : 'Créer mon compte'}
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
