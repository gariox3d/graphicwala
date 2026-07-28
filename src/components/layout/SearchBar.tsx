import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';

interface SearchResult {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  image_url: string | null;
}

const SearchBar = ({ onNavigate }: { onNavigate?: () => void }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchProducts = async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('id, name, price, sale_price, image_url')
      .eq('is_active', true)
      .ilike('name', `%${searchQuery.trim()}%`)
      .limit(6);
    setResults(data || []);
    setIsOpen(true);
    setLoading(false);
  };

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchProducts(value), 300);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const handleSelect = () => {
    setIsOpen(false);
    setQuery('');
    onNavigate?.();
  };

  return (
    <div ref={containerRef} className="relative w-full md:max-w-xs">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search products..."
          className="pl-8 pr-8 h-9 text-sm"
        />
        {query && (
          <button onClick={handleClear} className="absolute right-2 top-1/2 -translate-y-1/2">
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full mt-1 w-full bg-background border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No products found</div>
          ) : (
            results.map((product) => (
              <Link
                key={product.id}
                to={`/product/${(product as any).slug || product.id}`}
                onClick={handleSelect}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted transition-colors"
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-10 w-10 rounded object-cover flex-shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-10 w-10 rounded bg-muted flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.sale_price ? (
                      <>
                        <span className="text-primary font-semibold">₹{product.sale_price}</span>
                        <span className="line-through ml-1">₹{product.price}</span>
                      </>
                    ) : (
                      <span>₹{product.price}</span>
                    )}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
