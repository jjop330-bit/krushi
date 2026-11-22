import React, { useState, useEffect } from 'react';
import { 
  Store, Package, ShoppingCart, DollarSign, TrendingUp, Plus, Edit2, 
  CheckCircle2, AlertTriangle, Truck, ExternalLink, ShieldCheck, Eye, EyeOff
} from 'lucide-react';
import { Product, SellerProfile, SellerSuborder } from '../types/marketplace';
import { MarketplaceService } from '../services/marketplaceService';

interface SellerDashboardProps {
  lang: 'or' | 'en';
  sellerId?: string;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  lang,
  sellerId = 'seller-ossc-bargarh'
}) => {
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [suborders, setSuborders] = useState<SellerSuborder[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'earnings' | 'profile'>('overview');
  const [isAddProductOpen, setIsAddProductOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // New product form
  const [newCategory, setNewCategory] = useState<string>('seeds');
  const [newTitleEn, setNewTitleEn] = useState<string>('');
  const [newTitleOr, setNewTitleOr] = useState<string>('');
  const [newDescEn, setNewDescEn] = useState<string>('');
  const [newDescOr, setNewDescOr] = useState<string>('');
  const [newPrice, setNewPrice] = useState<number>(500);
  const [newUnit, setNewUnit] = useState<string>('kg');
  const [newStock, setNewStock] = useState<number>(50);
  const [newIsOrganic, setNewIsOrganic] = useState<boolean>(false);
  const [newIsChemical, setNewIsChemical] = useState<boolean>(false);
  const [newCibrc, setNewCibrc] = useState<string>('');

  useEffect(() => {
    loadSellerData();
  }, [sellerId]);

  const loadSellerData = async () => {
    setLoading(true);
    try {
      const prof = await MarketplaceService.getSellerProfile(sellerId);
      setProfile(prof);

      const prods = await MarketplaceService.listSellerProducts(sellerId);
      setProducts(prods);

      const orders = await MarketplaceService.listSellerOrders(sellerId);
      setSuborders(orders);
    } catch (e) {
      console.error('Error loading seller dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await MarketplaceService.addProduct(sellerId, {
        category_id: newCategory,
        title_en: newTitleEn,
        title_or: newTitleOr || newTitleEn,
        description_en: newDescEn,
        description_or: newDescOr || newDescEn,
        price: Number(newPrice),
        unit: newUnit,
        stock_quantity: Number(newStock),
        image_urls: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop'],
        is_organic: newIsOrganic,
        is_chemical_regulated: newIsChemical,
        cibrc_registration_number: newCibrc || undefined
      });
      setProducts([created, ...products]);
      setIsAddProductOpen(false);
      // Reset form
      setNewTitleEn('');
      setNewTitleOr('');
      setNewDescEn('');
      setNewDescOr('');
    } catch (err: any) {
      alert(err.message || 'Failed to publish product');
    }
  };

  const handleUpdateStatus = async (suborderId: string, status: string) => {
    try {
      const updated = await MarketplaceService.updateSuborderStatus(sellerId, suborderId, status);
      setSuborders(suborders.map(s => s.id === suborderId ? updated : s));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const totalSales = suborders.reduce((sum, s) => sum + s.subtotal, 0);
  const totalCommission = suborders.reduce((sum, s) => sum + s.commission_amount, 0);
  const netEarnings = suborders.reduce((sum, s) => sum + s.seller_earnings, 0);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-2 border-agri-700 border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="text-xs">Loading seller workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Seller Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-agri-100 text-agri-800 text-xs font-bold uppercase tracking-wider">
              {lang === 'or' ? 'କୃଷି ବିକ୍ରେତା ପୋର୍ଟାଲ' : 'Agri Vendor Portal'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-lime-100 text-lime-900 text-xs font-extrabold flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-lime-700" />
              <span>{profile?.status}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {profile?.business_name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operating District: <span className="font-semibold capitalize text-slate-700">{profile?.operating_district}</span> | Contact: {profile?.contact_person} ({profile?.phone_number})
          </p>
        </div>

        <button
          onClick={() => setIsAddProductOpen(true)}
          className="px-4 py-2.5 bg-agri-800 hover:bg-agri-900 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'or' ? 'ନୂଆ ଉତ୍ପାଦ ଯୋଡନ୍ତୁ' : 'Add New Product'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold text-slate-600">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'overview' ? 'bg-agri-800 text-white shadow-sm' : 'hover:bg-slate-100'
          }`}
        >
          {lang === 'or' ? 'ସମୀକ୍ଷା' : 'Overview'}
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'products' ? 'bg-agri-800 text-white shadow-sm' : 'hover:bg-slate-100'
          }`}
        >
          {lang === 'or' ? 'ମୋର ଉତ୍ପାଦ' : 'Products'} ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'orders' ? 'bg-agri-800 text-white shadow-sm' : 'hover:bg-slate-100'
          }`}
        >
          {lang === 'or' ? 'ପ୍ରାପ୍ତ ଅର୍ଡର' : 'Orders'} ({suborders.length})
        </button>
        <button
          onClick={() => setActiveTab('earnings')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'earnings' ? 'bg-agri-800 text-white shadow-sm' : 'hover:bg-slate-100'
          }`}
        >
          {lang === 'or' ? 'ଉପାର୍ଜନ ଓ ଦେୟ' : 'Earnings & Payouts'}
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'profile' ? 'bg-agri-800 text-white shadow-sm' : 'hover:bg-slate-100'
          }`}
        >
          {lang === 'or' ? 'ବ୍ୟବସାୟ ପ୍ରୋଫାଇଲ୍' : 'Store Profile'}
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500 block">Total Gross Sales</span>
              <span className="text-2xl font-black text-slate-900">₹{totalSales.toFixed(2)}</span>
              <span className="text-[11px] text-emerald-600 font-bold block">From {suborders.length} suborders</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500 block">Net Seller Earnings</span>
              <span className="text-2xl font-black text-agri-800">₹{netEarnings.toFixed(2)}</span>
              <span className="text-[11px] text-slate-400 font-medium block">After {profile?.commission_rate}% commission</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500 block">Active Catalog</span>
              <span className="text-2xl font-black text-slate-900">{products.length}</span>
              <span className="text-[11px] text-lime-700 font-bold block">Verified items</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500 block">Pending Dispatch</span>
              <span className="text-2xl font-black text-amber-600">
                {suborders.filter(s => s.fulfilment_status === 'PROCESSING').length}
              </span>
              <span className="text-[11px] text-slate-400 block">Orders awaiting shipment</span>
            </div>
          </div>

          {/* Recent Orders Preview */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm">Recent Buyer Orders</h3>
            {suborders.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No buyer orders received yet.</p>
            ) : (
              <div className="space-y-3">
                {suborders.slice(0, 3).map((sub) => (
                  <div key={sub.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">Suborder: #{sub.suborder_number}</span>
                      <span className="text-slate-500 block">Items: {sub.items.map(i => `${i.product_title} (x${i.quantity})`).join(', ')}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900 block text-sm">₹{sub.subtotal.toFixed(2)}</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
                        {sub.fulfilment_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-slate-900">Published Product Inventory</h3>
            <span className="text-xs text-slate-500">{products.length} products listed</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 px-2">Product</th>
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2">Price</th>
                  <th className="py-3 px-2">Stock</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-2 font-bold text-slate-900 max-w-xs truncate">
                      {lang === 'or' ? p.title_or : p.title_en}
                    </td>
                    <td className="py-3 px-2 capitalize text-slate-600">{p.category_id}</td>
                    <td className="py-3 px-2 font-bold text-slate-900">₹{p.price.toFixed(2)} / {p.unit}</td>
                    <td className="py-3 px-2 font-semibold">
                      <span className={p.stock_quantity > 10 ? 'text-lime-700' : 'text-rose-600'}>
                        {p.stock_quantity}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded-md bg-lime-100 text-lime-900 font-bold text-[10px]">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-amber-500 font-bold">★ {p.rating.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900">Customer Fulfilment Suborders</h3>
          {suborders.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No orders received yet.</p>
          ) : (
            <div className="space-y-4">
              {suborders.map((sub) => (
                <div key={sub.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <span className="font-black text-slate-900 text-sm block">#{sub.suborder_number}</span>
                      <span className="text-slate-500 text-[11px]">Carrier: {sub.shipping_carrier} | Tracking: {sub.tracking_number}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-slate-500 font-semibold">Status:</label>
                      <select
                        value={sub.fulfilment_status}
                        onChange={(e) => handleUpdateStatus(sub.id, e.target.value)}
                        className="px-2.5 py-1 rounded-xl border border-slate-300 bg-white font-bold text-slate-800"
                      >
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                    {sub.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-[11px]">
                        <span className="font-semibold text-slate-800">{item.product_title} × {item.quantity}</span>
                        <span className="font-bold text-slate-900">₹{item.total_price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                    <span>Order Subtotal: ₹{sub.subtotal.toFixed(2)}</span>
                    <span>Platform Commission: ₹{sub.commission_amount.toFixed(2)}</span>
                    <span className="font-bold text-agri-900 text-xs">Net Payout: ₹{sub.seller_earnings.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Earnings Tab */}
      {activeTab === 'earnings' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900">Settlement & Payout Accounting</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500">Gross Sales</span>
              <p className="text-xl font-black text-slate-900 mt-1">₹{totalSales.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500">Platform Commission (5%)</span>
              <p className="text-xl font-black text-rose-600 mt-1">-₹{totalCommission.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500">Net Settled Earnings</span>
              <p className="text-xl font-black text-emerald-700 mt-1">₹{netEarnings.toFixed(2)}</p>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Payouts are automatically settled to registered bank account ending in <span className="font-bold">{profile?.bank_account_number_masked}</span> on every Monday.
          </p>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 max-w-xl text-xs">
          <h3 className="text-sm font-extrabold text-slate-900">Seller Entity Verification Profile</h3>
          <div className="space-y-2">
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Business Name:</span>
              <span className="font-bold text-slate-900">{profile?.business_name}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">License Number:</span>
              <span className="font-bold text-slate-900">{profile?.license_number}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Operating District:</span>
              <span className="font-bold text-slate-900 capitalize">{profile?.operating_district}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Registered Bank A/C:</span>
              <span className="font-bold text-slate-900">{profile?.bank_account_number_masked} (IFSC: {profile?.bank_ifsc})</span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-slate-500">Verification Status:</span>
              <span className="font-extrabold text-lime-700">{profile?.status}</span>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Add New Agricultural Product</h3>
              <button onClick={() => setIsAddProductOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="seeds">Seeds & Planting Materials</option>
                  <option value="fertilizers">Fertilizers & Nutrients</option>
                  <option value="organic">Organic Farming Products</option>
                  <option value="crop_protection">Crop Protection & Traps</option>
                  <option value="tools">Farming Tools</option>
                  <option value="harvesting">Harvesting & Storage Equipment</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Product Title (English)</label>
                <input
                  type="text"
                  required
                  value={newTitleEn}
                  onChange={(e) => setNewTitleEn(e.target.value)}
                  placeholder="e.g. Certified CR Dhan 1018 Seeds"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Product Title (Odia)</label>
                <input
                  type="text"
                  value={newTitleOr}
                  onChange={(e) => setNewTitleOr(e.target.value)}
                  placeholder="ଯଥା: ସି.ଆର. ଧାନ ୧୦୧୮ ପ୍ରମାଣିତ ବିହନ"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="30 kg bag / litre"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stock Qty</label>
                  <input
                    type="number"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description (English)</label>
                <textarea
                  required
                  rows={2}
                  value={newDescEn}
                  onChange={(e) => setNewDescEn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="flex items-center space-x-4 pt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsOrganic}
                    onChange={(e) => setNewIsOrganic(e.target.checked)}
                    className="rounded text-agri-700"
                  />
                  <span>🌿 Certified Organic</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsChemical}
                    onChange={(e) => setNewIsChemical(e.target.checked)}
                    className="rounded text-agri-700"
                  />
                  <span>⚠️ CIBRC Regulated</span>
                </label>
              </div>

              {newIsChemical && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">CIBRC Registration No.</label>
                  <input
                    type="text"
                    required
                    value={newCibrc}
                    onChange={(e) => setNewCibrc(e.target.value)}
                    placeholder="CIR-XXXX/2026/..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-agri-800 hover:bg-agri-900 text-white font-bold rounded-xl shadow-md transition-all mt-2"
              >
                Publish to Krushi Store Catalog
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
