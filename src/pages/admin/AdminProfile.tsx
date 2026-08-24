import { useAuthStore } from '../../store/auth';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { Button } from '../../components/ui/Button';

export function AdminProfile() {
  const { userProfile } = useAuthStore();
  
  if (!userProfile) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <AdminPageHeader 
        title="Profil Administrateur"
        description="Gérez vos informations personnelles."
      />

      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-[#6B3E1E] flex items-center justify-center font-bold text-3xl text-white">
            {userProfile.firstName.charAt(0)}{userProfile.lastName.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-stone-900">{userProfile.firstName} {userProfile.lastName}</h2>
            <p className="text-[#E67E22] font-bold mt-1">{userProfile.role}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-stone-500 mb-1">Email (Lecture seule)</label>
            <input 
              type="text" 
              value={userProfile.email} 
              disabled 
              className="w-full bg-stone-50 border border-stone-200 rounded-md px-4 py-2 text-stone-600"
            />
          </div>
          
          <div className="pt-4 flex gap-2">
            <Button disabled className="bg-[#E67E22] text-white opacity-50">Mettre à jour le profil</Button>
            <p className="text-xs text-stone-400 mt-2">La modification du profil est désactivée dans cette démo.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
