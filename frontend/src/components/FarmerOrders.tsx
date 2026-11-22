import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle2, Clock, MapPin, ChevronRight, ShoppingBag } from 'lucide-react';
import { Order } from '../types/marketplace';
import { MarketplaceService } from '../services/marketplaceService';

interface FarmerOrdersProps {
  lang: 'or' | 'en';
  farmerId?: string;
  onNavigateStore?: () => void;
}

export const FarmerOrders: React.FC<FarmerOrdersProps> = ({
  lang,
  farmerId = 'farmer-local',
  onNavigateStore
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadOrders();
  }, [farmerId]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const ords = await MarketplaceService.listFarmerOrders(farmerId);
      setOrders(ords);
    } catch (e) {
      console.error('Failed to load farmer orders:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-2 border-agri-700 border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="text-xs">Loading order history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fadeIn">
      {/* Title */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200">
        <h1 className="text-2xl font-black text-slate-900">
          {lang === 'or' ? 'ମୋର କ୍ରୟ ଅର୍ଡର ଇତିହାସ' : 'My Krushi Store Orders'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {lang === 'or'
            ? 'ଆପଣଙ୍କ ପ୍ରମାଣିତ ବିହନ ଓ କୃଷି ଉତ୍ପାଦର ବିତରଣ ସ୍ଥିତି ଏବଂ ସବ୍‌-ଅର୍ଡର ଟ୍ରାକିଂ ଦେଖନ୍ତୁ।'
            : 'Track shipping status, supplier fulfilment details, and delivery across all your multi-vendor purchases.'}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            {lang === 'or' ? 'ଆପଣ ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ଅର୍ଡର କରିନାହାଁନ୍ତି' : 'No Orders Placed Yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {lang === 'or'
              ? 'କୃଷି ଷ୍ଟୋରରୁ ପ୍ରମାଣିତ ଧାନ ବିହନ, ଜୈବିକ କୀଟନାଶକ କିମ୍ବା ଫସଲ ସୁରକ୍ଷା ଉପକରଣ ବ୍ରାଉଜ୍ କରନ୍ତୁ।'
              : 'Browse certified seeds, biopesticides, and crop protection materials from verified Odisha dealers in the Krushi Store.'}
          </p>
          {onNavigateStore && (
            <button
              onClick={onNavigateStore}
              className="px-5 py-2.5 bg-agri-800 hover:bg-agri-900 text-white font-bold rounded-xl text-xs shadow-md transition-all"
            >
              {lang === 'or' ? 'କୃଷି ଷ୍ଟୋରକୁ ଯାଆନ୍ତୁ' : 'Go to Krushi Store'}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-slate-100 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-slate-900 text-sm">Order #{order.order_number}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-lime-100 text-lime-900 font-extrabold text-[10px]">
                      {order.order_status}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-slate-900 block">₹{order.total_amount.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">
                    Paid via {order.payment_method} ({order.payment_status})
                  </span>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="flex items-start space-x-2 text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <MapPin className="w-4 h-4 text-agri-800 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 block">{order.farmer_name} ({order.farmer_phone})</span>
                  <span>{order.shipping_address}, {order.district.toUpperCase()}</span>
                </div>
              </div>

              {/* Multi-Vendor Suborders Breakdown */}
              <div className="space-y-3 pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Fulfilment Parcels ({order.suborders.length} Suppliers):
                </span>

                {order.suborders.map((sub) => (
                  <div key={sub.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{sub.seller_name}</span>
                        <span className="text-[11px] text-slate-500 block">Suborder #{sub.suborder_number}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px]">
                        {sub.fulfilment_status}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                      {sub.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-800 font-medium">{item.product_title} × {item.quantity}</span>
                          <span className="font-bold text-slate-900">₹{item.total_price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center space-x-1 text-[11px] text-slate-500">
                      <Truck className="w-3.5 h-3.5 text-agri-700" />
                      <span>Carrier: <span className="font-semibold text-slate-700">{sub.shipping_carrier}</span> (Tracking: {sub.tracking_number})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
