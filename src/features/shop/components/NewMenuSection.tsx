import { ShopMenuWithImages } from '../actions';
import { MenuCard } from './MenuCard';

interface NewMenuSectionProps {
  menus: ShopMenuWithImages[];
}

export function NewMenuSection({ menus }: NewMenuSectionProps) {
  if (!menus || menus.length === 0) return null;

  return (
    <section className="mb-12 py-1 px-4 sm:px-8">
      {/* Main Card Container */}
      <div className="relative w-full rounded-3xl bg-[#F97352] overflow-hidden shadow-xl shadow-orange-200/50">
        
        {/* --- FIXED PATTERN VISIBILITY HERE --- */}
        {/* Increased opacity to 0.3 and dot size to 2px so it is clearly visible */}
        <div 
            className="absolute inset-0 pointer-events-none opacity-30" 
            style={{ 
                backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)', 
                backgroundSize: '32px 32px' 
            }}
        >
        </div>
        
        {/* Large Decorative Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none mix-blend-overlay" />
        <div className="absolute bottom-0 left-20 w-72 h-72 bg-yellow-400 opacity-20 rounded-full blur-3xl -mb-32 pointer-events-none mix-blend-overlay" />

        {/* Content Container */}
        <div className="relative z-10 pt-8 pb-10">
          
          {/* Header Section */}
          <div className="px-6 mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Icon Box */}
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl shadow-inner border border-white/30 text-white">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                  <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576L8.279 5.044A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clipRule="evenodd" />
                </svg>
              </div>
              
              <div className="flex flex-col">
                <h2 className="text-3xl font-bold text-white tracking-tight">New Menuu !!!</h2>
                <p className="text-orange-50 text-sm font-medium opacity-90">
                  Chef's daily selections, hot and ready.
                </p>
              </div>
            </div>
          </div>

          {/* Horizontal Scroll Area */}
          <div className="w-full">
            <div className="flex gap-5 justify-center overflow-x-auto pb-6 px-6 snap-x scroll-pl-6 hide-scrollbar pt-2">
              {menus.map((menu) => (
                <div 
                  key={menu.id} 
                  className="min-w-[240px] w-[240px] md:min-w-[280px] md:w-[280px] snap-start"
                >
                  <div className="transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/20 rounded-xl">
                    <MenuCard menu={menu} />
                  </div>
                </div>
              ))}
              {/* <div className="w-2 shrink-0" /> */}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}