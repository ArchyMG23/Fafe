import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { MarketplaceHome } from './MarketplaceHome';
import { MarketplaceProduct } from './MarketplaceProduct';
import { MarketplaceCart } from './MarketplaceCart';
import { MarketplaceCheckout } from './MarketplaceCheckout';
import { MarketplaceConfirmation } from './MarketplaceConfirmation';

export function MarketplaceLayout() {
  return (
    <div className="min-h-screen bg-stone-50/30">
      <Routes>
        <Route index element={<MarketplaceHome />} />
        <Route path="produit/:slug" element={<MarketplaceProduct />} />
        <Route path="panier" element={<MarketplaceCart />} />
        <Route path="commande" element={<MarketplaceCheckout />} />
        <Route path="confirmation/:id" element={<MarketplaceConfirmation />} />
        <Route path="*" element={<Navigate to="/marketplace" replace />} />
      </Routes>
    </div>
  );
}
