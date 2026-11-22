import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, ShieldCheck, CheckCircle2, 
  Trash2, ArrowRight, Store, Package, X
} from 'lucide-react';
import { ProductCategory, ShoppingCart, Order } from '../types/marketplace';
import { MarketplaceService } from '../services/marketplaceService';

interface KrushiStoreProps {
  lang: 'or' | 'en';
  onNavigateOrders?: () => void;
  onNavigateSellerPortal?: () => void;
  initialFilterPest?: string;
  initialFilterCrop?: string;
}

export const KrushiStore: React.FC<KrushiStoreProps> = ({
  lang,
  onNavigateOrders,
  onNavigateSellerPortal,
  initialFilterPest,
  initialFilterCrop
}) => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPest, setSelectedPest] = useState<string>(initialFilterPest || 'all');
  const [selectedCrop, setSelectedCrop] = useState<string>(initialFilterCrop || 'all');
  const [organicOnly, setOrganicOnly] = useState<boolean>(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  // Cart & Modals
  const [cart, setCart] = useState<ShoppingCart | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState<boolean>(false);
  const [orderConfirmation, setOrderConfirmation] = useState<Order | null>(null);

  // Checkout form state
  const [checkoutName, setCheckoutName] = useState<string>('Dharanidhar Pradhan');
  const [checkoutPhone, setCheckoutPhone] = useState<string>('9861000000');
  const [checkoutAddress, setCheckoutAddress] = useState<string>('At/PO Nuapali, Block Bheden');
  const [checkoutDistrict, setCheckoutDistrict] = useState<string>('bargarh');
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<string>('ONLINE');
  const [checkoutSubmitting, setCheckoutSubmitting] = useState<boolean>(false);

  // Seller registration form state
  const [sellerBizName, setSellerBizName] = useState<string>('');
  const [sellerContact, setSellerContact] = useState<string>('');
  const [sellerPhone, setSellerPhone] = useState<string>('');
  const [sellerEmail, setSellerEmail] = useState<string>('');
  const [sellerAddress, setSellerAddress] = useState<string>('');
  const [sellerDistrict, setSellerDistrict] = useState<string>('bargarh');
  const [sellerBizType, setSellerBizType] = useState<string>('retailer');
  const [sellerLicense, setSellerLicense] = useState<string>('');
  const [sellerBankAcc, setSellerBankAcc] = useState<string>('');
  const [sellerBankIfsc, setSellerBankIfsc] = useState<string>('');
  const [sellerSuccessMsg, setSellerSuccessMsg] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadData();
    refreshCart();
  }, []);

  const loadData = async () => {
    try {
      const cats = await MarketplaceService.getCategories();
      setCategories(cats);
    } catch (e) {
      console.error('Failed to load store categories:', e);
    }
  };

  const refreshCart = async () => {
    try {
      const c = await MarketplaceService.getCart();
      setCart(c);
    } catch (e) {
      console.error('Error fetching cart:', e);
    }
  };

  const handleUpdateQuantity = async (productId: string, qty: number) => {
    try {
      const updated = await MarketplaceService.updateCartItem(productId, qty);
      setCart(updated);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRemoveFromCart = async (productId: string) => {
    try {
      const updated = await MarketplaceService.removeFromCart(productId);
      setCart(updated);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutSubmitting(true);
    try {
      const order = await MarketplaceService.checkout({
        farmer_name: checkoutName,
        farmer_phone: checkoutPhone,
        shipping_address: checkoutAddress,
        district: checkoutDistrict,
        payment_method: checkoutPaymentMethod
      });
      setOrderConfirmation(order);
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
      await refreshCart();
    } catch (err: any) {
      alert(err.message || 'Checkout failed');
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  const handleSellerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const seller = await MarketplaceService.registerSeller({
        business_name: sellerBizName,
        contact_person: sellerContact,
        phone_number: sellerPhone,
        email: sellerEmail || undefined,
        business_address: sellerAddress,
        operating_district: sellerDistrict,
        business_type: sellerBizType,
        license_number: sellerLicense,
        bank_account_number: sellerBankAcc,
        bank_ifsc: sellerBankIfsc
      });
      setSellerSuccessMsg(
        lang === 'or'
          ? `ଆପଣଙ୍କ ବିକ୍ରେତା ଆବେଦନ (${seller.business_name}) ସଫଳତାର ସହ ଦାଖଲ ହୋଇଛି! ପ୍ରଶାସକଙ୍କ ଯାଞ୍ଚ ପରେ ଉତ୍ପାଦ ତାଲିକାଭୁକ୍ତ କରିପାରିବେ।`
          : `Seller application for "${seller.business_name}" submitted! Awaiting administrator document verification.`
      );
      setTimeout(() => {
        setIsSellerModalOpen(false);
        setSellerSuccessMsg(null);
      }, 3500);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-7xl mx-auto">
      {/* Top Banner / Store Header */}
      <div className="bg-gradient-to-r from-[#0F3822] to-[#1B5E39] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <Store className="w-64 h-64" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-lime-400/20 text-lime-300 text-xs font-bold uppercase tracking-wider mb-2 border border-lime-400/30">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{lang === 'or' ? 'ଓଡ଼ିଶା କୃଷି ଇ-କମର୍ସ ମାର୍କେଟପ୍ଲେସ୍' : 'Odisha Multi-Vendor Agri Marketplace'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {lang === 'or' ? 'କୃଷି ଷ୍ଟୋର (Krushi Store)' : 'Krushi Store — Verified Agro Inputs'}
          </h1>
          <p className="text-agri-100 text-sm sm:text-base mt-2">
            {lang === 'or'
              ? 'ପ୍ରମାଣିତ ଧାନ ବିହନ, ଜୈବିକ କୀଟନାଶକ, ଫେରୋମୋନ ଟ୍ରାପ୍ ଓ କୃଷି ଯନ୍ତ୍ରପାତି ସିଧାସଳଖ ସରକାରୀ ଓ ପ୍ରମାଣିତ ବିକ୍ରେତାଙ୍କଠାରୁ ଅର୍ଡର କରନ୍ତୁ।'
              : 'Direct procurement of certified seeds, organic biopesticides, sticky traps, and farm tools from verified Odisha cooperatives and dealers.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-lime-500 hover:bg-lime-400 text-agri-950 font-bold rounded-xl transition-all shadow-md text-xs sm:text-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{lang === 'or' ? 'କ୍ରୟ ଥଳି ଦେଖନ୍ତୁ' : 'View Cart'} ({cart?.items.length || 0})</span>
            </button>

            {onNavigateOrders && (
              <button
                onClick={onNavigateOrders}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all border border-white/20 text-xs sm:text-sm"
              >
                <Package className="w-4 h-4" />
                <span>{lang === 'or' ? 'ମୋର ଅର୍ଡର' : 'My Orders'}</span>
              </button>
            )}

            <button
              onClick={() => setIsSellerModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl transition-all shadow-md text-xs sm:text-sm ml-auto"
            >
              <Store className="w-4 h-4" />
              <span>{lang === 'or' ? 'ବିକ୍ରେତା ଭାବେ ଯୋଗଦିଅନ୍ତୁ' : 'Become a Seller'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'or' ? 'ଉତ୍ପାଦ କିମ୍ବା ଔଷଧ ନାମ ଖୋଜନ୍ତୁ (ଯଥା: MTU-1010, Neem Oil, Traps)...' : 'Search seeds, biopesticides, traps, tools...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-500 bg-slate-50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedPest}
              onChange={(e) => setSelectedPest(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-agri-500"
            >
              <option value="all">{lang === 'or' ? 'ସମସ୍ତ କୀଟ ସମାଧାନ' : 'Target Pest: All'}</option>
              <option value="bph">Brown Planthopper (ମାଟିଆ ଗୁଣ୍ଡି)</option>
              <option value="stem_borer">Stem Borer (ମଜା ପୋକ)</option>
              <option value="leaf_folder">Leaf Folder (ପତ୍ରମୋଡ଼ା)</option>
              <option value="armyworm">Armyworm (ଲେଡା ପୋକ)</option>
            </select>

            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-agri-500"
            >
              <option value="all">{lang === 'or' ? 'ସମସ୍ତ ଫସଲ' : 'Crop: All'}</option>
              <option value="paddy">Paddy / Rice (ଧାନ)</option>
              <option value="maize">Maize (ମକା)</option>
              <option value="pulses">Pulses (ମୁଗ / ବିରି)</option>
              <option value="tomato">Tomato (ବିଲାତି ବାଇଗଣ)</option>
            </select>

            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-agri-500"
            >
              <option value="all">{lang === 'or' ? 'ସମସ୍ତ ଜିଲ୍ଲା' : 'District: All'}</option>
              <option value="bargarh">Bargarh (ବରଗଡ଼)</option>
              <option value="sambalpur">Sambalpur (ସମ୍ବଲପୁର)</option>
              <option value="cuttack">Cuttack (କଟକ)</option>
            </select>

            <button
              onClick={() => setOrganicOnly(!organicOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                organicOnly ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              🌿 {lang === 'or' ? 'କେବଳ ଜୈବିକ' : 'Organic Only'}
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-agri-800 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {lang === 'or' ? 'ସମସ୍ତ ବର୍ଗ (All)' : 'All Categories'}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === c.id
                  ? 'bg-agri-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lang === 'or' ? c.name_or : c.name_en}
            </button>
          ))}
        </div>
      </div>

      {/* Active Diagnostic Connection Banner */}
      {(initialFilterPest || initialFilterCrop) && (
        <div className="bg-lime-50 border border-lime-200 rounded-2xl p-3 px-4 flex items-center justify-between text-xs text-lime-900">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-lime-700 flex-shrink-0" />
            <span>
              {lang === 'or'
                ? `AI ନିରୀକ୍ଷଣ ଅନୁଯାୟୀ ${initialFilterPest || ''} ପାଇଁ ଅନୁମୋଦିତ ସୁରକ୍ଷା ଉତ୍ପାଦ ଦେଖାଯାଉଛି।`
                : `Showing recommended verified agricultural inputs filtered for diagnosed pest: ${initialFilterPest?.toUpperCase() || ''}.`}
            </span>
          </div>
          <button
            onClick={() => { setSelectedPest('all'); setSelectedCrop('all'); }}
            className="text-xs font-bold text-lime-800 underline hover:text-lime-950 ml-2"
          >
            {lang === 'or' ? 'ସମସ୍ତ ଉତ୍ପାଦ ଦେଖନ୍ତୁ' : 'Clear Filter'}
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col p-6 animate-slideLeft">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-agri-800" />
                <h3 className="text-lg font-bold text-slate-900">
                  {lang === 'or' ? 'ଆପଣଙ୍କ କ୍ରୟ ଥଳି' : 'Shopping Cart'} ({cart?.items.length || 0})
                </h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {!cart || cart.items.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <ShoppingBag className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-xs">{lang === 'or' ? 'କ୍ରୟ ଥଳି ଖାଲି ଅଛି।' : 'Your cart is currently empty.'}</p>
                </div>
              ) : (
                cart.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <img
                      src={item.product.image_urls[0]}
                      alt={item.product.title_en}
                      className="w-14 h-14 object-cover rounded-xl border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {lang === 'or' ? item.product.title_or : item.product.title_en}
                      </h4>
                      <span className="text-[11px] text-slate-500 block">
                        ₹{item.product.price.toFixed(2)} / {item.product.unit}
                      </span>
                      <div className="flex items-center space-x-2 mt-1">
                        <button
                          onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                          className="w-5 h-5 rounded bg-white border border-slate-200 text-xs font-bold flex items-center justify-center hover:bg-slate-100"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold px-1.5">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                          className="w-5 h-5 rounded bg-white border border-slate-200 text-xs font-bold flex items-center justify-center hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 block">
                        ₹{item.total_price.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleRemoveFromCart(item.product_id)}
                        className="text-rose-500 hover:text-rose-700 text-xs mt-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Subtotal & Checkout */}
            {cart && cart.items.length > 0 && (
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>{lang === 'or' ? 'ମୂଳ ମୂଲ୍ୟ (Subtotal):' : 'Subtotal:'}</span>
                    <span className="font-semibold text-slate-900">₹{cart.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{lang === 'or' ? 'ଡେଲିଭରି ଶୁଳ୍କ:' : 'Delivery Fee:'}</span>
                    <span className="font-semibold text-slate-900">
                      {cart.delivery_fee === 0 ? 'FREE' : `₹${cart.delivery_fee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-100">
                    <span>{lang === 'or' ? 'ମୋଟ ରାଶି:' : 'Total Amount:'}</span>
                    <span className="text-agri-900">₹{cart.total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-3 bg-agri-800 hover:bg-agri-900 text-white font-bold rounded-2xl shadow-md transition-all text-sm flex items-center justify-center space-x-2"
                >
                  <span>{lang === 'or' ? 'ଅର୍ଡର ଚେକ୍‌ଆଉଟ୍ କରନ୍ତୁ' : 'Proceed to Checkout'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                {lang === 'or' ? 'ଚେକ୍‌ଆଉଟ୍ ଓ ବିତରଣ ଠିକଣା' : 'Checkout & Delivery Details'}
              </h3>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {lang === 'or' ? 'ଚାଷୀଙ୍କ ନାମ' : 'Farmer / Consignee Full Name'}
                </label>
                <input
                  type="text"
                  required
                  value={checkoutName}
                  onChange={(e) => setCheckoutName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {lang === 'or' ? 'ମୋବାଇଲ୍ ନମ୍ବର (SMS ସତର୍କତା ପାଇଁ)' : 'Contact Phone Number'}
                </label>
                <input
                  type="tel"
                  required
                  value={checkoutPhone}
                  onChange={(e) => setCheckoutPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {lang === 'or' ? 'ଗ୍ରାମ / ବ୍ଲକ୍ / ଠିକଣା' : 'Village, GP, Block & Shipping Address'}
                </label>
                <textarea
                  required
                  rows={2}
                  value={checkoutAddress}
                  onChange={(e) => setCheckoutAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {lang === 'or' ? 'ଜିଲ୍ଲା' : 'District'}
                  </label>
                  <select
                    value={checkoutDistrict}
                    onChange={(e) => setCheckoutDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="bargarh">Bargarh (ବରଗଡ଼)</option>
                    <option value="sambalpur">Sambalpur (ସମ୍ବଲପୁର)</option>
                    <option value="bolangir">Bolangir (ବଲାଙ୍ଗୀର)</option>
                    <option value="cuttack">Cuttack (କଟକ)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {lang === 'or' ? 'ପେମେଣ୍ଟ ମାଧ୍ୟମ' : 'Payment Method'}
                  </label>
                  <select
                    value={checkoutPaymentMethod}
                    onChange={(e) => setCheckoutPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="ONLINE">UPI / Online Netbanking</option>
                    <option value="COD">Cash on Delivery (COD)</option>
                  </select>
                </div>
              </div>

              <div className="bg-lime-50 border border-lime-200 rounded-xl p-3 text-xs text-lime-900 mt-2">
                <span className="font-bold">Total Payable: ₹{cart?.total.toFixed(2)}</span>
                <p className="text-[11px] text-lime-700 mt-0.5">
                  Multi-vendor cart will create seller-specific tracking orders automatically.
                </p>
              </div>

              <button
                type="submit"
                disabled={checkoutSubmitting}
                className="w-full py-2.5 bg-agri-800 hover:bg-agri-900 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-md transition-all text-xs sm:text-sm"
              >
                {checkoutSubmitting ? 'Placing Order...' : (lang === 'or' ? 'ଅର୍ଡର ନିଶ୍ଚିତ କରନ୍ତୁ' : 'Confirm Order')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Order Confirmation Screen */}
      {orderConfirmation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4 animate-scaleUp">
            <div className="w-14 h-14 bg-lime-100 text-lime-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900">
              {lang === 'or' ? 'ଅର୍ଡର ସଫଳତାର ସହ ଗ୍ରହଣ କରାଯାଇଛି!' : 'Order Placed Successfully!'}
            </h3>
            <p className="text-xs text-slate-600">
              Order Ref: <span className="font-bold text-agri-800">{orderConfirmation.order_number}</span>
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Amount:</span>
                <span className="font-bold text-slate-900">₹{orderConfirmation.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fulfilment Suborders:</span>
                <span className="font-bold text-slate-900">{orderConfirmation.suborders.length} suppliers</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Shipping To:</span>
                <span className="font-semibold text-slate-800">{orderConfirmation.shipping_address}</span>
              </div>
            </div>

            <div className="flex space-x-3">
              {onNavigateOrders && (
                <button
                  onClick={() => {
                    setOrderConfirmation(null);
                    onNavigateOrders();
                  }}
                  className="flex-1 py-2.5 bg-agri-800 hover:bg-agri-900 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  {lang === 'or' ? 'ମୋର ଅର୍ଡର ଦେଖନ୍ତୁ' : 'Track Order in My Orders'}
                </button>
              )}
              <button
                onClick={() => setOrderConfirmation(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                {lang === 'or' ? 'ବନ୍ଦ କରନ୍ତୁ' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seller Onboarding Modal */}
      {isSellerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-agri-800 uppercase tracking-wider block">
                  Multi-Vendor Onboarding
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  {lang === 'or' ? 'କୃଷି ବିକ୍ରେତା ପଞ୍ଜୀକରଣ' : 'Agri Vendor Registration'}
                </h3>
              </div>
              <button onClick={() => setIsSellerModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {sellerSuccessMsg ? (
              <div className="p-6 bg-lime-50 border border-lime-200 rounded-2xl text-center text-xs text-lime-900 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-lime-700 mx-auto" />
                <p className="font-bold">{sellerSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSellerRegister} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Business / Firm / FPO Name</label>
                  <input
                    type="text"
                    required
                    value={sellerBizName}
                    onChange={(e) => setSellerBizName(e.target.value)}
                    placeholder="e.g. Maa Mangala Agro Seeds & Inputs"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Contact Person</label>
                    <input
                      type="text"
                      required
                      value={sellerContact}
                      onChange={(e) => setSellerContact(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      value={sellerPhone}
                      onChange={(e) => setSellerPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Business Address & Block</label>
                  <input
                    type="text"
                    required
                    value={sellerAddress}
                    onChange={(e) => setSellerAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">District</label>
                    <select
                      value={sellerDistrict}
                      onChange={(e) => setSellerDistrict(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="bargarh">Bargarh</option>
                      <option value="sambalpur">Sambalpur</option>
                      <option value="bolangir">Bolangir</option>
                      <option value="cuttack">Cuttack</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Business Type</label>
                    <select
                      value={sellerBizType}
                      onChange={(e) => setSellerBizType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="retailer">Agri Input Retailer</option>
                      <option value="fpo">Farmer Producer Org (FPO)</option>
                      <option value="distributor">Distributor</option>
                      <option value="manufacturer">Seed / Bio Manufacturer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Seed / Pesticide License No.</label>
                  <input
                    type="text"
                    required
                    value={sellerLicense}
                    onChange={(e) => setSellerLicense(e.target.value)}
                    placeholder="OD/AGRI/2026/..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Bank Settlement A/C</label>
                    <input
                      type="text"
                      required
                      value={sellerBankAcc}
                      onChange={(e) => setSellerBankAcc(e.target.value)}
                      placeholder="Account number"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">IFSC Code</label>
                    <input
                      type="text"
                      required
                      value={sellerBankIfsc}
                      onChange={(e) => setSellerBankIfsc(e.target.value)}
                      placeholder="SBIN0000000"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-agri-800 hover:bg-agri-900 text-white font-bold rounded-xl shadow-md transition-all text-xs"
                >
                  Submit Application for Verification
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
