import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, Store, ShoppingBag, DollarSign, CheckCircle2, 
  XCircle, TrendingUp, AlertCircle, Settings, Building2, UserCheck
} from 'lucide-react';
import { SellerProfile } from '../types/marketplace';
import { ExpertProfile } from '../types/expert';
import { ExpertService } from '../services/expertService';

interface AdminDashboardProps {
  lang: 'or' | 'en';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ lang }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [experts, setExperts] = useState<ExpertProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'sellers' | 'experts' | 'commissions'>('overview');
  const [commissionRate, setCommissionRate] = useState<number>(5.0);
  const [commissionSavedMsg, setCommissionSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const m = await ExpertService.getAdminMetrics();
      setMetrics(m);
      if (m?.marketplace?.platform_commission_rate) {
        setCommissionRate(m.marketplace.platform_commission_rate);
      }

      // Fetch sellers and experts
      const resSellers = await fetch(`${ExpertService['getApiBase']()}/admin/sellers`);
      if (resSellers.ok) setSellers(await resSellers.json());

      const resExperts = await fetch(`${ExpertService['getApiBase']()}/admin/experts`);
      if (resExperts.ok) setExperts(await resExperts.json());
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSellerStatus = async (sellerId: string, status: string) => {
    try {
      const updated = await ExpertService.updateSellerStatus(sellerId, status);
      setSellers(sellers.map(s => s.id === sellerId ? updated : s));
      loadAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateExpertStatus = async (expertId: string, status: string) => {
    try {
      const updated = await ExpertService.updateExpertStatus(expertId, status);
      setExperts(experts.map(e => e.id === expertId ? updated : e));
      loadAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ExpertService.setCommissionRate(commissionRate);
      setCommissionSavedMsg('Platform marketplace commission policy updated successfully.');
      setTimeout(() => setCommissionSavedMsg(null), 3000);
      loadAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-2 border-agri-700 border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="text-xs">Loading platform administrative controls...</p>
      </div>
    );
  }

  const mkt = metrics?.marketplace || {};
  const exp = metrics?.expert_support || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Admin Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-agri-100 text-agri-800 text-xs font-bold uppercase tracking-wider">
              {lang === 'or' ? 'କୃଷି ମିତ୍ର ପ୍ରଶାସନିକ କେନ୍ଦ୍ର' : 'Krushi Mitra Administrative Console'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              Database Sync Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {lang === 'or' ? 'ପ୍ଲାଟଫର୍ମ ପରିଚାଳନା ଓ ସମୀକ୍ଷା' : 'Marketplace & Advisory Governance'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time audit records, multi-vendor seller compliance, expert authorizations, and commission settlements.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs font-bold text-slate-600">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'overview' ? 'bg-agri-800 text-white shadow-sm' : 'hover:bg-slate-100'
          }`}
        >
          {lang === 'or' ? 'ମୁଖ୍ୟ ମେଟ୍ରିକ୍ସ' : 'Platform Metrics'}
        </button>
        <button
          onClick={() => setActiveTab('sellers')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'sellers' ? 'bg-agri-800 text-white shadow-sm' : 'hover:bg-slate-100'
          }`}
        >
          {lang === 'or' ? 'ବିକ୍ରେତା ଯାଞ୍ଚ' : 'Seller Verification'} ({sellers.length})
        </button>
        <button
          onClick={() => setActiveTab('experts')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'experts' ? 'bg-agri-800 text-white shadow-sm' : 'hover:bg-slate-100'
          }`}
        >
          {lang === 'or' ? 'ବିଶେଷଜ୍ଞ ପ୍ୟାନେଲ୍' : 'Expert Panel'} ({experts.length})
        </button>
        <button
          onClick={() => setActiveTab('commissions')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'commissions' ? 'bg-agri-800 text-white shadow-sm' : 'hover:bg-slate-100'
          }`}
        >
          {lang === 'or' ? 'କମିଶନ ନୀତି' : 'Commission Policy'}
        </button>
      </div>

      {/* Overview Metrics */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Marketplace Economics
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-500 font-semibold block">Total Marketplace Sales</span>
                <span className="text-2xl font-black text-slate-900">₹{(mkt.total_sales || 0).toFixed(2)}</span>
                <span className="text-[11px] text-emerald-600 font-bold block">{mkt.total_orders || 0} orders completed</span>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-500 font-semibold block">Marketplace Commissions</span>
                <span className="text-2xl font-black text-agri-800">₹{(mkt.marketplace_commissions || 0).toFixed(2)}</span>
                <span className="text-[11px] text-slate-500 block">Rate: {mkt.platform_commission_rate}%</span>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-500 font-semibold block">Active Sellers</span>
                <span className="text-2xl font-black text-slate-900">{mkt.verified_sellers || 0}</span>
                <span className="text-[11px] text-lime-700 font-bold block">{mkt.total_sellers || 0} registered firms</span>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-500 font-semibold block">Pending Seller Payouts</span>
                <span className="text-2xl font-black text-amber-600">₹{(mkt.pending_seller_payouts || 0).toFixed(2)}</span>
                <span className="text-[11px] text-slate-400 block">Weekly settlement cycle</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Expert Advisory & KVK Network
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-500 font-semibold block">Verified Agronomists</span>
                <span className="text-2xl font-black text-slate-900">{exp.verified_experts || 0}</span>
                <span className="text-[11px] text-agri-700 font-bold block">OUAT & KVK</span>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-500 font-semibold block">Total Consultations</span>
                <span className="text-2xl font-black text-agri-800">{exp.total_support_requests || 0}</span>
                <span className="text-[11px] text-emerald-600 font-bold block">{exp.resolved_requests || 0} resolved</span>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-500 font-semibold block">Average Response Time</span>
                <span className="text-2xl font-black text-slate-900">{exp.average_response_time || '18 mins'}</span>
                <span className="text-[11px] text-slate-400 block">From request submission</span>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-500 font-semibold block">Completion Rate</span>
                <span className="text-2xl font-black text-emerald-600">{exp.consultation_completion_rate || 94}%</span>
                <span className="text-[11px] text-slate-400 block">Farmer satisfaction score</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seller Verification Tab */}
      {activeTab === 'sellers' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="text-sm font-extrabold text-slate-900">Multi-Vendor Seller Applications & Compliance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 px-2">Business Name</th>
                  <th className="py-3 px-2">Contact</th>
                  <th className="py-3 px-2">District</th>
                  <th className="py-3 px-2">License No.</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sellers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-3 px-2 font-bold text-slate-900">{s.business_name}</td>
                    <td className="py-3 px-2 text-slate-600">{s.contact_person} ({s.phone_number})</td>
                    <td className="py-3 px-2 capitalize text-slate-600">{s.operating_district}</td>
                    <td className="py-3 px-2 font-mono text-[11px]">{s.license_number || 'N/A'}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        s.status === 'VERIFIED' ? 'bg-lime-100 text-lime-900' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 space-x-1">
                      {s.status !== 'VERIFIED' && (
                        <button
                          onClick={() => handleUpdateSellerStatus(s.id, 'VERIFIED')}
                          className="px-2.5 py-1 bg-lime-600 hover:bg-lime-700 text-white font-bold rounded-lg text-[10px]"
                        >
                          Verify & Authorize
                        </button>
                      )}
                      {s.status !== 'SUSPENDED' && (
                        <button
                          onClick={() => handleUpdateSellerStatus(s.id, 'SUSPENDED')}
                          className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-[10px]"
                        >
                          Suspend
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expert Panel Tab */}
      {activeTab === 'experts' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="text-sm font-extrabold text-slate-900">Agricultural Scientists & KVK Agronomists</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 px-2">Scientist</th>
                  <th className="py-3 px-2">Institution</th>
                  <th className="py-3 px-2">Specialization</th>
                  <th className="py-3 px-2">Rating</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {experts.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="py-3 px-2 font-bold text-slate-900">{e.full_name}</td>
                    <td className="py-3 px-2 text-slate-600">{e.institution}</td>
                    <td className="py-3 px-2 text-slate-600">{e.specialization}</td>
                    <td className="py-3 px-2 text-amber-500 font-bold">★ {e.rating.toFixed(1)}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        e.status === 'VERIFIED' ? 'bg-lime-100 text-lime-900' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 space-x-1">
                      {e.status !== 'VERIFIED' && (
                        <button
                          onClick={() => handleUpdateExpertStatus(e.id, 'VERIFIED')}
                          className="px-2.5 py-1 bg-lime-600 hover:bg-lime-700 text-white font-bold rounded-lg text-[10px]"
                        >
                          Verify Credentials
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Commissions Tab */}
      {activeTab === 'commissions' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 max-w-lg text-xs">
          <h3 className="text-sm font-extrabold text-slate-900">Platform Marketplace Commission Policy</h3>
          <p className="text-slate-500">
            Configure the platform fee percentage automatically deducted from seller gross order subtotals during multi-vendor checkout splitting.
          </p>

          <form onSubmit={handleSaveCommission} className="space-y-4 pt-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Standard Platform Commission (%)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="30"
                  required
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  className="w-32 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold"
                />
                <span className="font-bold text-slate-700">%</span>
              </div>
            </div>

            {commissionSavedMsg && (
              <div className="p-3 bg-lime-50 border border-lime-200 rounded-xl text-lime-900 font-bold">
                {commissionSavedMsg}
              </div>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 bg-agri-800 hover:bg-agri-900 text-white font-bold rounded-xl shadow-md transition-all"
            >
              Update Policy
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
