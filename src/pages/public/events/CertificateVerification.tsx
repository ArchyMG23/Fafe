import { useParams } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export function CertificateVerification() {
  const { certificateId } = useParams<{ certificateId: string }>();

  return (
    <div className="bg-[#FAF9F6] min-h-screen pt-24 pb-16 flex items-center justify-center">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-stone-100 max-w-lg w-full text-center">
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold font-heading text-[#6B3E1E] mb-4">Certificat Valide</h1>
        <p className="text-stone-600 mb-6">Le certificat <strong>{certificateId}</strong> est authentique et a été délivré par le FAFE.</p>
        
        <div className="bg-stone-50 p-6 rounded-2xl text-left border border-stone-100">
          <p className="text-sm text-stone-500 mb-1">Délivré à</p>
          <p className="font-bold text-[#6B3E1E] mb-4">Participant(e) FAFE</p>
          
          <p className="text-sm text-stone-500 mb-1">Pour l'événement</p>
          <p className="font-bold text-[#6B3E1E] mb-4">Événement FAFE 2026</p>
          
          <p className="text-sm text-stone-500 mb-1">Date d'émission</p>
          <p className="font-bold text-[#6B3E1E]">21 Août 2026</p>
        </div>
      </div>
    </div>
  );
}
