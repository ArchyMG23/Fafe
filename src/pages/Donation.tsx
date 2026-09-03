import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Lock, ArrowRight, Loader2, Heart, CheckCircle2, ShieldCheck, ArrowLeft, Building2, Copy } from 'lucide-react';
import { Project, Donation as DonationType } from '../types';
import { PaymentService } from '../services/payment';
import { useAuthStore } from '../store/auth';
import { getPublishedCMSContent, defaultDonsCMS } from '../lib/cms';

const PREDEFINED_AMOUNTS = [5000, 10000, 25000, 50000, 100000];
const CURRENCIES = ['XAF', 'EUR', 'USD', 'GBP'];

type Step = 'FORM' | 'SUMMARY';

export function Donation() {
  const navigate = useNavigate();
  const { userProfile: user } = useAuthStore();
  
  const [step, setStep] = useState<Step>('FORM');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [cmsData, setCmsData] = useState<any>(defaultDonsCMS);

  // Form State
  const [frequency, setFrequency] = useState<'ONE_TIME' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL'>('ONE_TIME');
  const [amount, setAmount] = useState<number | ''>('');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [currency, setCurrency] = useState<'XAF'|'EUR'|'USD'|'GBP'>('XAF');
  
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [country, setCountry] = useState(user?.country || '');
  const [organisation, setOrganisation] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [projectId, setProjectId] = useState<string>('GENERAL');

  useEffect(() => {
    const fetchCMS = async () => {
      try {
        const data = await getPublishedCMSContent('dons', defaultDonsCMS);
        setCmsData(data);
      } catch (err) {
        console.error("Error fetching donation CMS data:", err);
      }
    };
    fetchCMS();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const q = query(
          collection(db, 'projects'), 
          where('status', '==', 'ACTIVE'),
          where('donationEnabled', '==', true)
        );
        const snapshot = await getDocs(q);
        const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        setActiveProjects(projectsData);
      } catch (error) {
        console.error("Error fetching projects", error);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  const getFinalAmount = () => {
    return customAmount ? parseInt(customAmount) : (amount as number);
  };

  const handleProceedToSummary = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmt = getFinalAmount();
    if (!finalAmt || finalAmt <= 0) {
      alert("Veuillez saisir un montant valide.");
      return;
    }
    setStep('SUMMARY');
  };

  const handleConfirmDonation = async () => {
    setIsProcessing(true);
    try {
      const finalAmt = getFinalAmount();
      
      // 1. Create Donation Record
      const donationData: Partial<DonationType> = {
        donorUserId: user ? user.id : undefined,
        donorFirstName: firstName,
        donorLastName: lastName,
        donorEmail: email,
        donorPhone: phone,
        donorCountry: country,
        organisation: organisation,
        anonymous: anonymous,
        amount: finalAmt,
        currency: currency,
        frequency: frequency,
        projectId: projectId,
        paymentStatus: 'PENDING',
        donationStatus: 'PENDING',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const docRef = await addDoc(collection(db, 'donations'), donationData);

      // 2. Initialize Payment
      // In a real flow, this could contact the backend which contacts the provider
      const paymentInit = await PaymentService.processPayment(
        finalAmt,
        currency,
        'FLUTTERWAVE',
        frequency,
        { name: `${firstName} ${lastName}`, email, phone },
        docRef.id
      );
      
      if (paymentInit.providerRedirectUrl) {
        window.location.href = paymentInit.providerRedirectUrl;
        return;
      }
      
      if (paymentInit.paymentStatus === 'SUCCESS' || paymentInit.paymentStatus === 'PENDING') {
        navigate('/dons/succes', { 
          state: { 
            donationId: docRef.id, 
            reference: paymentInit.transactionReference,
            email: email
          } 
        });
      } else {
        alert("Erreur lors de l'initialisation du paiement.");
        setIsProcessing(false);
      }

    } catch (error) {
      console.error("Error processing donation:", error);
      alert("Une erreur est survenue lors de la préparation de votre don.");
      setIsProcessing(false);
    }
  };

  const selectedProjectName = projectId === 'GENERAL' 
    ? 'FAFE — Fonds général' 
    : activeProjects.find(p => p.id === projectId)?.title || 'Projet inconnu';

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-32 pb-20">
      <div className="w-full max-w-7xl mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-orange-100 rounded-full mb-6">
            <Heart className="w-8 h-8 text-[#E67E22]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-[#6B3E1E] mb-6">
            Soutenez l'entrepreneuriat féminin africain
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            Votre contribution aide à créer des opportunités, renforcer les compétences et soutenir les initiatives portées par les femmes entrepreneures à travers l'Afrique.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8 items-start">
          <div className="md:col-span-3">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 sm:p-8">
                {step === 'FORM' && (
                  <form onSubmit={handleProceedToSummary}>
                    {/* Type de don */}
                    <div className="mb-8">
                      <label className="block text-sm font-semibold text-[#6B3E1E] mb-3">Type de don</label>
                      <div className="grid grid-cols-2 gap-2 bg-stone-100 p-1 rounded-lg">
                        <button
                          type="button"
                          className={`py-2 px-4 text-sm font-medium rounded-md transition-colors ${['MONTHLY', 'QUARTERLY', 'ANNUAL'].includes(frequency) ? 'text-stone-600 hover:text-stone-800' : 'bg-white text-[#6B3E1E] shadow-sm'}`}
                          onClick={() => setFrequency('ONE_TIME')}
                        >
                          Don ponctuel
                        </button>
                        <button
                          type="button"
                          className={`py-2 px-4 text-sm font-medium rounded-md transition-colors ${['MONTHLY', 'QUARTERLY', 'ANNUAL'].includes(frequency) ? 'bg-white text-[#6B3E1E] shadow-sm' : 'text-stone-600 hover:text-stone-800'}`}
                          onClick={() => setFrequency('MONTHLY')}
                        >
                          Don récurrent
                        </button>
                      </div>
                      
                      {['MONTHLY', 'QUARTERLY', 'ANNUAL'].includes(frequency) && (
                        <div className="mt-3 flex gap-2">
                          <button type="button" onClick={() => setFrequency('MONTHLY')} className={`flex-1 py-1.5 text-xs font-medium rounded-full border ${frequency === 'MONTHLY' ? 'border-[#E67E22] bg-orange-50 text-[#E67E22]' : 'border-stone-200 text-stone-500 hover:bg-stone-50'}`}>Mensuel</button>
                          <button type="button" onClick={() => setFrequency('QUARTERLY')} className={`flex-1 py-1.5 text-xs font-medium rounded-full border ${frequency === 'QUARTERLY' ? 'border-[#E67E22] bg-orange-50 text-[#E67E22]' : 'border-stone-200 text-stone-500 hover:bg-stone-50'}`}>Trimestriel</button>
                          <button type="button" onClick={() => setFrequency('ANNUAL')} className={`flex-1 py-1.5 text-xs font-medium rounded-full border ${frequency === 'ANNUAL' ? 'border-[#E67E22] bg-orange-50 text-[#E67E22]' : 'border-stone-200 text-stone-500 hover:bg-stone-50'}`}>Annuel</button>
                        </div>
                      )}
                    </div>

                    {/* Montant et Devise */}
                    <div className="mb-8">
                      <div className="flex justify-between items-end mb-3">
                        <label className="block text-sm font-semibold text-[#6B3E1E]">Montant du don</label>
                        <select 
                          value={currency} 
                          onChange={(e) => setCurrency(e.target.value as any)}
                          className="text-sm bg-stone-100 border-none rounded-md px-2 py-1 font-medium text-[#6B3E1E] focus:ring-0 cursor-pointer"
                        >
                          {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                        {PREDEFINED_AMOUNTS.map(val => (
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
                            {val.toLocaleString('fr-FR')} {currency}
                          </button>
                        ))}
                      </div>
                      
                      <div className="relative">
                        <Input
                          type="number"
                          min="1"
                          placeholder="Autre montant..."
                          value={customAmount}
                          onChange={(e) => {
                            setCustomAmount(e.target.value);
                            setAmount('');
                          }}
                          className={`pl-4 pr-16 h-12 text-lg ${customAmount ? 'border-[#E67E22] ring-1 ring-[#E67E22]' : ''}`}
                        />
                        <div className="absolute right-4 top-3 text-stone-500 font-medium">{currency}</div>
                      </div>
                    </div>

                    {/* Projet soutenu */}
                    <div className="mb-8">
                      <label className="block text-sm font-semibold text-[#6B3E1E] mb-3">Affectation de mon don</label>
                      <select 
                        className="w-full h-11 px-3 rounded-md border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E67E22] focus:border-transparent"
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                      >
                        <option value="GENERAL">FAFE — Fonds général</option>
                        {!loadingProjects && activeProjects.map(p => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                    </div>

                    {/* Informations personnelles */}
                    <div className="space-y-4 mb-8">
                      <label className="block text-sm font-semibold text-[#6B3E1E]">Informations personnelles</label>
                      
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Input placeholder="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                        <Input placeholder="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Input type="email" placeholder="Adresse e-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <Input type="tel" placeholder="Numéro de téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <Input placeholder="Pays" value={country} onChange={(e) => setCountry(e.target.value)} required />
                        <Input placeholder="Organisation (Optionnel)" value={organisation} onChange={(e) => setOrganisation(e.target.value)} />
                      </div>

                      <label className="flex items-center gap-2 mt-4 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={anonymous}
                          onChange={(e) => setAnonymous(e.target.checked)}
                          className="rounded border-stone-300 text-[#E67E22] focus:ring-[#E67E22]" 
                        />
                        <span className="text-sm text-stone-600">Faire ce don anonymement (le nom n'apparaîtra pas publiquement)</span>
                      </label>
                    </div>

                    <Button 
                      type="submit" 
                      variant="gold" 
                      size="lg" 
                      className="w-full text-lg h-14 shadow-md bg-[#E67E22] hover:bg-[#c96a1a] text-white border-0"
                      disabled={(!amount && !customAmount) || !firstName || !lastName || !email || !country}
                    >
                      Continuer <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </form>
                )}

                {step === 'SUMMARY' && (
                  <div>
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="text-xl font-bold font-heading text-[#6B3E1E]">Résumé de votre don</h3>
                      <button onClick={() => setStep('FORM')} className="text-sm text-[#E67E22] hover:underline flex items-center">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Modifier
                      </button>
                    </div>

                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 mb-8 space-y-4">
                      <div className="flex justify-between border-b border-stone-200 pb-3">
                        <span className="text-stone-500 text-sm">Type de don</span>
                        <span className="font-semibold text-stone-900 text-sm">
                          {frequency === 'ONE_TIME' ? 'Don ponctuel' : `Don récurrent (${frequency.toLowerCase()})`}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-stone-200 pb-3">
                        <span className="text-stone-500 text-sm">Montant</span>
                        <span className="font-bold text-lg text-[#E67E22]">
                          {getFinalAmount().toLocaleString('fr-FR')} {currency}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-stone-200 pb-3">
                        <span className="text-stone-500 text-sm">Projet soutenu</span>
                        <span className="font-semibold text-stone-900 text-sm text-right max-w-[200px] truncate">{selectedProjectName}</span>
                      </div>
                      <div className="flex justify-between border-b border-stone-200 pb-3">
                        <span className="text-stone-500 text-sm">Nom du donateur</span>
                        <span className="font-semibold text-stone-900 text-sm">
                          {anonymous ? 'Anonyme' : `${firstName} ${lastName}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500 text-sm">Email</span>
                        <span className="font-semibold text-stone-900 text-sm">{email}</span>
                      </div>
                    </div>

                    <Button 
                      onClick={handleConfirmDonation}
                      disabled={isProcessing}
                      className="w-full text-lg h-14 shadow-md bg-[#6B3E1E] hover:bg-[#5a3318] text-white border-0"
                    >
                      {isProcessing ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Traitement en cours...</>
                      ) : (
                        <><ShieldCheck className="w-5 h-5 mr-2" /> Confirmer le don de {getFinalAmount().toLocaleString('fr-FR')} {currency}</>
                      )}
                    </Button>
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-stone-500">
                      <Lock className="w-3 h-3" />
                      Paiement 100% sécurisé via notre partenaire
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Information sidebar */}
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-[#6B3E1E] text-white border-0 shadow-lg">
              <CardContent className="p-8 flex flex-col h-full">
                <div className="mb-8">
                  <h2 className="text-2xl font-heading italic mb-6 border-b border-white/20 pb-4 text-white">L'Impact de votre Don</h2>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <ul className="space-y-4 text-sm text-stone-200">
                      <li className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">1</div>
                        <p><strong className="text-white block">Formations</strong> Mentorat et ateliers techniques pour les membres.</p>
                      </li>
                      <li className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">2</div>
                        <p><strong className="text-white block">Accompagnement</strong> Aide à la structuration et la formalisation.</p>
                      </li>
                      <li className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">3</div>
                        <p><strong className="text-white block">Réseau</strong> Organisation d'événements panafricains.</p>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-auto">
                  <div className="pt-6 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                      <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                      <span className="font-bold text-sm">Transparence FAFE</span>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed">
                      L'intégralité de vos dons est allouée aux projets sociaux et au développement de l'entrepreneuriat féminin. Le FAFE est une organisation officielle.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bank details card */}
            {cmsData?.bankDetails && (
              <Card className="bg-white border border-stone-200 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="w-5 h-5 text-[#E67E22]" />
                    <h3 className="font-bold font-heading text-sm text-[#6B3E1E]">Coordonnées Virement Bancaire</h3>
                  </div>
                  <div className="space-y-2.5 text-xs text-stone-600 bg-stone-50 p-4 rounded-xl border border-stone-200">
                    {cmsData.bankDetails.bankName && (
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase font-bold">Banque</span>
                        <span className="font-semibold text-stone-800">{cmsData.bankDetails.bankName}</span>
                      </div>
                    )}
                    {cmsData.bankDetails.accountHolder && (
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase font-bold">Titulaire</span>
                        <span className="font-semibold text-stone-800">{cmsData.bankDetails.accountHolder}</span>
                      </div>
                    )}
                    {cmsData.bankDetails.iban && (
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase font-bold">IBAN / Numéro de compte</span>
                        <span className="font-mono font-bold text-stone-900 select-all">{cmsData.bankDetails.iban}</span>
                      </div>
                    )}
                    {cmsData.bankDetails.swift && (
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase font-bold">Code SWIFT / BIC</span>
                        <span className="font-mono font-bold text-stone-900 select-all">{cmsData.bankDetails.swift}</span>
                      </div>
                    )}
                  </div>
                  {cmsData.bankDetails.instructions && (
                    <p className="text-[11px] text-stone-500 mt-3 italic">
                      {typeof cmsData.bankDetails.instructions === 'object' 
                        ? (cmsData.bankDetails.instructions.fr || cmsData.bankDetails.instructions.en)
                        : cmsData.bankDetails.instructions}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
