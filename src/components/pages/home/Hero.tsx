import { Link } from "react-router-dom";
import { Button } from "../../ui/Button";
import { useLanguageStore } from "../../../store/language";
import { getCMSLocalizedText } from "../../../lib/cms";
import { FafeImage } from "../../ui/FafeImage";

export function Hero({ hero }: { hero: any }) {
  const { language } = useLanguageStore();
  
  return (
    <section className="bg-[#FAF9F6] py-10">
      <div className="fafe-container">
        <div className="bg-gradient-to-br from-[#FFFDF9] to-[#E8F3EF] rounded-[2rem] p-8 md:p-12 relative overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
             <div>
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full text-xs font-bold text-[#00843D] mb-4 shadow-sm">
                 <span className="w-2 h-2 rounded-full bg-[#00843D]"></span> FAFE
               </div>
               <h1 className="text-5xl md:text-7xl font-bold font-heading text-[#063F3A] leading-[1.1] mb-6">
                 {getCMSLocalizedText(hero.title, language)}
               </h1>
               <p className="text-lg text-stone-600 mb-8 max-w-lg">
                 {getCMSLocalizedText(hero.shortText, language)}
               </p>
               
               {hero.showEmailForm && (
                 <div className="bg-white p-2 rounded-full flex items-center shadow-md max-w-md mb-4">
                   <input type="email" placeholder={getCMSLocalizedText(hero.emailPlaceholder, language)} className="flex-1 px-4 py-2 bg-transparent outline-none" />
                   <Link to={hero.buttonLink || "/rejoindre"}>
                     <Button className="bg-[#00843D] text-white rounded-full">Commencer →</Button>
                   </Link>
                 </div>
               )}
               <Link to={hero.secondaryButtonLink || "/nous"} className="text-sm font-semibold text-stone-600 hover:text-[#00843D]">
                 {getCMSLocalizedText(hero.secondaryButtonText, language)}
               </Link>
             </div>
             
             <div className="relative aspect-square">
               {hero.heroImage && (
                 <FafeImage src={hero.heroImage} alt="Hero" className="w-full h-full object-cover rounded-2xl" loading="eager" />
               )}
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
