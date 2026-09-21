import { Link } from "react-router-dom";
import { Card, CardContent } from "../../ui/Card";
import { ArrowRight } from "lucide-react";
import { FafeImage } from "../../../components/ui/FafeImage";
import { getCMSLocalizedText } from "../../../lib/cms";
import { useLanguageStore } from "../../../store/language";

export function Featured({ featuredEntrepreneurs, featuredNews }: { featuredEntrepreneurs: any, featuredNews: any }) {
  const { language } = useLanguageStore();

  return (
    <section className="fafe-container py-12 md:py-20">
        <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 border-r border-stone-200">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <div className="w-12 h-1 bg-[#00843D] mb-4"></div>
                        <h2 className="text-3xl font-bold font-heading text-[#063F3A]">
                            {getCMSLocalizedText(featuredEntrepreneurs.title, language)}
                        </h2>
                        <p className="text-stone-600">{getCMSLocalizedText(featuredEntrepreneurs.subtitle, language)}</p>
                    </div>
                    <Link to="/entrepreneures" className="font-bold text-[#00843D]">Voir tout →</Link>
                </div>
                {/* Entrepreneurs grid */}
            </div>
            
            <div className="lg:col-span-1">
                <h2 className="text-2xl font-bold font-heading text-[#063F3A] mb-6">
                    {getCMSLocalizedText(featuredNews.title, language)}
                </h2>
                {/* News list */}
            </div>
        </div>
    </section>
  );
}
