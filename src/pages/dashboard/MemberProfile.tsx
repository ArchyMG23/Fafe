import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuthStore } from '../../store/auth';
import { db } from '../../lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Save, CheckCircle2, AlertCircle } from 'lucide-react';

export function MemberProfile() {
  const { userProfile, setProfile } = useAuthStore();
  
  const [formData, setFormData] = useState({
    firstName: userProfile?.firstName || '',
    lastName: userProfile?.lastName || '',
    phone: userProfile?.phone || '',
    country: userProfile?.country || '',
    city: userProfile?.city || '',
    photoURL: userProfile?.photoURL || ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const userRef = doc(db, 'users', userProfile.id);
      
      const updates = {
        ...formData,
        updatedAt: Date.now()
      };
      
      await updateDoc(userRef, updates);
      
      // Update local store
      setProfile({
        ...userProfile,
        ...updates
      });

      setMessage({ type: 'success', text: 'Profil mis à jour avec succès.' });
    } catch (error) {
      console.error("Error updating profile", error);
      setMessage({ type: 'error', text: 'Une erreur est survenue lors de la mise à jour.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!userProfile) return null;

  return (
    <Card className="border border-[#6B3E1E]/5 shadow-sm bg-white rounded-2xl">
      <CardHeader className="border-b border-[#6B3E1E]/5 px-8 py-6">
        <CardTitle className="text-2xl font-bold font-heading text-[#6B3E1E]">Mon profil</CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 font-medium ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#6B3E1E] mb-1">Prénom</label>
              <Input 
                name="firstName" 
                required 
                value={formData.firstName} 
                onChange={handleChange} 
                className="focus:border-[#E67E22]" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B3E1E] mb-1">Nom</label>
              <Input 
                name="lastName" 
                required 
                value={formData.lastName} 
                onChange={handleChange} 
                className="focus:border-[#E67E22]" 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#6B3E1E] mb-1">Adresse e-mail</label>
            <Input 
              type="email" 
              value={userProfile.email} 
              disabled 
              className="bg-stone-50 text-stone-500 cursor-not-allowed border-stone-200" 
            />
            <p className="mt-1 text-xs text-[#6B3E1E]/60">L'adresse e-mail ne peut pas être modifiée.</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#6B3E1E] mb-1">Téléphone</label>
            <Input 
              type="tel" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              className="focus:border-[#E67E22]" 
            />
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#6B3E1E] mb-1">Pays</label>
              <Input 
                name="country" 
                value={formData.country} 
                onChange={handleChange} 
                className="focus:border-[#E67E22]" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B3E1E] mb-1">Ville</label>
              <Input 
                name="city" 
                value={formData.city} 
                onChange={handleChange} 
                className="focus:border-[#E67E22]" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6B3E1E] mb-1">URL Photo de profil</label>
            <Input 
              type="url" 
              name="photoURL" 
              value={formData.photoURL} 
              onChange={handleChange} 
              className="focus:border-[#E67E22]" 
              placeholder="https://..."
            />
            <p className="mt-1 text-xs text-[#6B3E1E]/60">Option: En attendant le module d'upload, entrez l'URL d'une image existante.</p>
          </div>
          
          <div className="pt-4 border-t border-[#6B3E1E]/10 flex justify-end">
            <Button 
              type="submit" 
              className="bg-[#E67E22] hover:bg-[#c96a1a] text-white py-6 px-8 rounded-xl font-bold shadow-md flex items-center gap-2" 
              disabled={isLoading}
            >
              <Save className="w-5 h-5" />
              {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
