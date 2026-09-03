const fs = require('fs');
let code = fs.readFileSync('src/pages/public/marketplace/MarketplaceHome.tsx', 'utf8');

const oldLoading = `        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 text-[#E67E22] animate-spin" />
          </div>
        ) : (`;

const newLoading = `        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="space-y-6 hidden lg:block">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 h-96 animate-pulse">
                <div className="h-6 w-32 bg-stone-200 rounded mb-6"></div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 w-full bg-stone-100 rounded-xl"></div>)}
                </div>
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white rounded-2xl border border-stone-100 overflow-hidden h-[400px] animate-pulse flex flex-col">
                    <div className="w-full aspect-square bg-stone-200"></div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="h-4 w-1/3 bg-stone-200 rounded mb-2"></div>
                      <div className="h-5 w-3/4 bg-stone-200 rounded mb-2"></div>
                      <div className="h-4 w-full bg-stone-100 rounded mb-auto"></div>
                      <div className="h-6 w-1/2 bg-stone-200 rounded mt-4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (`;

code = code.replace(oldLoading, newLoading);
fs.writeFileSync('src/pages/public/marketplace/MarketplaceHome.tsx', code);
