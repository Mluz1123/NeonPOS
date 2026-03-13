import { POSTabs } from '@/components/pos/POSTabs';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { POSCart } from '@/components/pos/POSCart';

export default function POSPage() {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <POSTabs />
      
      <div className="flex-1 flex gap-8 min-h-0">
        <div className="flex-[1.5] flex flex-col min-h-0">
          <ProductGrid />
        </div>
        
        <div className="flex-1 min-h-0">
          <POSCart />
        </div>
      </div>
    </div>
  );
}
