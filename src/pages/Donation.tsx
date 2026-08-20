import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Lock } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/auth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { PaymentService } from '../services/payment';
import { DonationFrequency } from '../types';

export function Donation() {
  const [amount, setAmount] = useState<number | ''>(10000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [frequency, setFrequency] = useState<DonationFrequency>('ONE_TIME');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { userProfile } = useAuthStore();

  // Form fields
  const [firstName, setFirstName] = useState(userProfile?.firstName || '');
  const [lastName, setLastName] = useState(userProfile?.lastName || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');

  const navigate = useNavigate();

  const predefinedAmounts = [5000, 10000, 25000, 50000, 100000];

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    const finalAmount = customAmount ? parseInt(customAmount) : (amount || 0);
    
    try {
      const result = await PaymentService.processPayment(
        finalAmount,
        'FCFA',
        'CREDIT_CARD_SIMULATED',
        frequency,
        {
          name: `${firstName} ${lastName}`.trim(),
          email,
          phone
        }
      );

      // Save to Firestore
      await addDoc(collection(db, 'donations'), {
        ...result,
        userId: userProfile?.id || null, // Associate with member if logged in
        donorName: result.donorName,
        donorEmail: result.donorEmail,
        amount: result.amount,
        currency: result.currency,
        frequency: result.frequency,
        status: result.status,
        transactionReference: result.transactionReference,
        createdAt: result.createdAt,
      });

      navigate('/dons/succes', { 
        state: { 
          amount: result.amount, 
          transactionId: result.transactionReference,
          type: result.frequency
        } 
      });
    } catch (error) {
      console.error("Payment failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-16">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-[#E67E22] mb-6">
            <Heart className="w-8 h-8 fill-current" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-heading text-[#6B3E1E] mb-4">
            Soutenez l'entrepreneuriat féminin africain
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            Votre don permet au FAFE de financer des programmes de formation, d'accompagner des porteuses de projets et de structurer le réseau panafricain.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8 items-start">
          <div className="md:col-span-3">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <form onSubmit={handleDonate}>
                  {/* Type de don */}
                  <div className="flex p-1 bg-stone-100 rounded-lg mb-8">
                    <button
                      type="button"
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${frequency === 'ONE_TIME' ? 'bg-white text-[#6B3E1E] shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                      onClick={() => setFrequency('ONE_TIME')}
                    >
                      Don ponctuel
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${frequency === 'RECURRING' ? 'bg-white text-[#6B3E1E] shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                      onClick={() => setFrequency('RECURRING')}
                    >
                      Don mensuel
                    </button>
                  </div>

                  {/* Montants */}
                  <div className="mb-8">
                    <label className="block text-sm font-semibold text-[#6B3E1E] mb-3">Choisissez un montant (FCFA)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                      {predefinedAmounts.map(val => (
                        <button
                          key={val}
                          type="button"
                          className={`py-3 px-4 rounded-md border text-center font-medium transition-all ${
                            amount === val && !customAmount
                              ? 'border-[#E67E22] bg-orange-50 text-[#E67E22] ring-1 ring-[#E67E22]'
                              : 'border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50'
                          }`}
                          onClick={() => {
                            setAmount(val);
                            setCustomAmount('');
                          }}
                        >
                          {val.toLocaleString('fr-FR')}
                        </button>
                      ))}
                    </div>
                    
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="Autre montant..."
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setAmount('');
                        }}
                        className={`pl-4 pr-16 h-12 text-lg ${customAmount ? 'border-[#E67E22] ring-1 ring-[#E67E22]' : ''}`}
                      />
                      <div className="absolute right-4 top-3 text-stone-500 font-medium">FCFA</div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <label className="block text-sm font-semibold text-[#6B3E1E]">Informations personnelles (Optionnel)</label>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input 
                        placeholder="Prénom" 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                      <Input 
                        placeholder="Nom" 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                    <Input 
                      type="email" 
                      placeholder="Adresse e-mail (pour le reçu)" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Input 
                      type="tel" 
                      placeholder="Numéro de téléphone (optionnel)" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    variant="gold" 
                    size="lg" 
                    className="w-full text-lg h-14 shadow-md bg-[#E67E22] hover:bg-[#c96a1a] text-white border-0"
                    disabled={isProcessing || (!amount && !customAmount)}
                  >
                    {isProcessing ? 'Traitement en cours...' : `Faire un don de ${(customAmount ? parseInt(customAmount) : amount).toLocaleString('fr-FR')} FCFA`}
                  </Button>
                  
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-stone-500">
                    <Lock className="w-3 h-3" />
                    Paiement 100% sécurisé (Simulation)
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-[#6B3E1E] text-white border-0 shadow-lg">
              <CardContent className="p-10 flex flex-col h-full">
                <div className="mb-12">
                  <h2 className="text-2xl font-heading italic mb-6 border-b border-white/20 pb-4 text-white">Soutenez l'Impact</h2>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <p className="text-sm text-white/70 mb-4">Contribuez au financement de projets portés par des femmes entrepreneures à travers l'Afrique.</p>
                    <ul className="space-y-4 text-sm text-stone-200 mt-6">
                      <li className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">1</div>
                        <p><strong className="text-white block">Formations</strong> Mentorat et ateliers techniques.</p>
                      </li>
                      <li className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">2</div>
                        <p><strong className="text-white block">Accompagnement</strong> Aide à la structuration.</p>
                      </li>
                      <li className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">3</div>
                        <p><strong className="text-white block">Réseau</strong> Événements panafricains.</p>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="mt-10 pt-8 border-t border-white/10">
                    <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] mb-4">Réseau Panafricain</h4>
                    <div className="relative w-full aspect-square bg-white/5 rounded-full flex items-center justify-center">
                      <svg viewBox="0 0 100 100" className="w-32 h-32 fill-[#FAF9F6]/20">
                        <path d="M30,20 Q50,10 70,20 Q90,40 70,70 Q50,95 20,70 Q10,40 30,20" />
                      </svg>
                      <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-[#E67E22] rounded-full animate-pulse"></div>
                      <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse shadow-[0_0_15px_rgba(212,175,55,0.8)]"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
