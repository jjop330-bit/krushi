import { StorageService } from './storageService';
import {
  ProductCategory, Product, ShoppingCart, Order, SellerProfile, ProductReview, SellerSuborder
} from '../types/marketplace';

export class MarketplaceService {
  private static getApiBase(): string {
    const settings = StorageService.getSettings();
    return settings.backendUrl;
  }

  // Categories
  public static async getCategories(): Promise<ProductCategory[]> {
    try {
      const res = await fetch(`${this.getApiBase()}/store/categories`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('Using cached categories fallback:', e);
      return [
        { id: 'seeds', name_en: 'Seeds & Planting Materials', name_or: 'ବିହନ ଏବଂ ରୋପଣ ସାମଗ୍ରୀ', icon_name: 'Sprout', is_active: true },
        { id: 'fertilizers', name_en: 'Fertilizers & Soil Nutrients', name_or: 'ଖତ ଓ ମୃତ୍ତିକା ପୋଷକ ତତ୍ତ୍ୱ', icon_name: 'Layers', is_active: true },
        { id: 'organic', name_en: 'Organic Farming Products', name_or: 'ଜୈବିକ କୃଷି ଉତ୍ପାଦ', icon_name: 'Leaf', is_active: true },
        { id: 'irrigation', name_en: 'Irrigation Equipment', name_or: 'ଜଳସେଚନ ଉପକରଣ', icon_name: 'Droplet', is_active: true },
        { id: 'machinery', name_en: 'Agricultural Machinery', name_or: 'କୃଷି ଯନ୍ତ୍ରପାତି', icon_name: 'Cpu', is_active: true },
        { id: 'tools', name_en: 'Farming Tools', name_or: 'କୃଷି ଉପକରଣ ଓ ହସ୍ତକଳା', icon_name: 'Wrench', is_active: true },
        { id: 'crop_protection', name_en: 'Crop Protection & Traps', name_or: 'ଫସଲ ସୁରକ୍ଷା ଓ ଫାନ୍ଦ', icon_name: 'ShieldCheck', is_active: true },
        { id: 'harvesting', name_en: 'Harvesting & Storage Equipment', name_or: 'ଅମଳ ଓ ସଂରକ୍ଷଣ ଉପକରଣ', icon_name: 'PackageCheck', is_active: true }
      ];
    }
  }

  // Products
  public static async listProducts(params: {
    category_id?: string;
    crop_id?: string;
    pest_id?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    is_organic?: boolean;
    district?: string;
  } = {}): Promise<Product[]> {
    try {
      const query = new URLSearchParams();
      if (params.category_id) query.append('category_id', params.category_id);
      if (params.crop_id) query.append('crop_id', params.crop_id);
      if (params.pest_id) query.append('pest_id', params.pest_id);
      if (params.search) query.append('search', params.search);
      if (params.min_price !== undefined) query.append('min_price', String(params.min_price));
      if (params.max_price !== undefined) query.append('max_price', String(params.max_price));
      if (params.is_organic !== undefined) query.append('is_organic', String(params.is_organic));
      if (params.district) query.append('district', params.district);

      const res = await fetch(`${this.getApiBase()}/store/products?${query.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error('Failed to list products from API:', e);
      return [];
    }
  }

  public static async getProduct(id: string): Promise<Product | null> {
    try {
      const res = await fetch(`${this.getApiBase()}/store/products/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return null;
    }
  }

  public static async getProductReviews(productId: string): Promise<ProductReview[]> {
    try {
      const res = await fetch(`${this.getApiBase()}/store/products/${productId}/reviews`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  public static async submitReview(productId: string, data: { rating: number; comment: string; farmer_name: string }): Promise<ProductReview | null> {
    try {
      const res = await fetch(`${this.getApiBase()}/store/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return null;
    }
  }

  // Cart
  public static async getCart(farmerId: string = 'farmer-local'): Promise<ShoppingCart> {
    try {
      const res = await fetch(`${this.getApiBase()}/store/cart`, {
        headers: { 'x-farmer-id': farmerId }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return { id: `cart-${farmerId}`, user_id: farmerId, items: [], subtotal: 0, delivery_fee: 0, total: 0 };
    }
  }

  public static async addToCart(productId: string, quantity: number = 1, farmerId: string = 'farmer-local'): Promise<ShoppingCart> {
    const res = await fetch(`${this.getApiBase()}/store/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-farmer-id': farmerId },
      body: JSON.stringify({ product_id: productId, quantity })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to add item' }));
      throw new Error(err.detail || 'Failed to add item');
    }
    return await res.json();
  }

  public static async updateCartItem(productId: string, quantity: number, farmerId: string = 'farmer-local'): Promise<ShoppingCart> {
    const res = await fetch(`${this.getApiBase()}/store/cart/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-farmer-id': farmerId },
      body: JSON.stringify({ quantity })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update item' }));
      throw new Error(err.detail || 'Failed to update item');
    }
    return await res.json();
  }

  public static async removeFromCart(productId: string, farmerId: string = 'farmer-local'): Promise<ShoppingCart> {
    const res = await fetch(`${this.getApiBase()}/store/cart/${productId}`, {
      method: 'DELETE',
      headers: { 'x-farmer-id': farmerId }
    });
    if (!res.ok) throw new Error('Failed to remove item');
    return await res.json();
  }

  // Checkout & Orders
  public static async checkout(data: {
    farmer_name: string;
    farmer_phone: string;
    shipping_address: string;
    district: string;
    payment_method: string;
  }, farmerId: string = 'farmer-local'): Promise<Order> {
    const res = await fetch(`${this.getApiBase()}/store/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-farmer-id': farmerId },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Checkout failed' }));
      throw new Error(err.detail || 'Checkout failed');
    }
    return await res.json();
  }

  public static async listFarmerOrders(farmerId: string = 'farmer-local'): Promise<Order[]> {
    try {
      const res = await fetch(`${this.getApiBase()}/store/orders`, {
        headers: { 'x-farmer-id': farmerId }
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  // Seller Operations
  public static async registerSeller(data: any): Promise<SellerProfile> {
    const res = await fetch(`${this.getApiBase()}/sellers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Seller registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }
    return await res.json();
  }

  public static async getSellerProfile(sellerId: string): Promise<SellerProfile> {
    const res = await fetch(`${this.getApiBase()}/sellers/profile`, {
      headers: { 'x-seller-id': sellerId }
    });
    if (!res.ok) throw new Error('Seller profile not found');
    return await res.json();
  }

  public static async listSellerProducts(sellerId: string): Promise<Product[]> {
    try {
      const res = await fetch(`${this.getApiBase()}/sellers/products`, {
        headers: { 'x-seller-id': sellerId }
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  public static async addProduct(sellerId: string, data: any): Promise<Product> {
    const res = await fetch(`${this.getApiBase()}/sellers/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-seller-id': sellerId },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to add product' }));
      throw new Error(err.detail || 'Failed to add product');
    }
    return await res.json();
  }

  public static async listSellerOrders(sellerId: string): Promise<SellerSuborder[]> {
    try {
      const res = await fetch(`${this.getApiBase()}/sellers/orders`, {
        headers: { 'x-seller-id': sellerId }
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  public static async updateSuborderStatus(sellerId: string, suborderId: string, status: string, trackingNumber?: string): Promise<SellerSuborder> {
    const query = new URLSearchParams({ status });
    if (trackingNumber) query.append('tracking_number', trackingNumber);

    const res = await fetch(`${this.getApiBase()}/sellers/orders/${suborderId}/status?${query.toString()}`, {
      method: 'PATCH',
      headers: { 'x-seller-id': sellerId }
    });
    if (!res.ok) throw new Error('Failed to update status');
    return await res.json();
  }

  // Payment Gateway Status
  public static async getPaymentStatus(): Promise<any> {
    try {
      const res = await fetch(`${this.getApiBase()}/payments/status`);
      if (!res.ok) return { gateway_name: 'Razorpay / UPI India', is_configured: false, mode: 'SANDBOX' };
      return await res.json();
    } catch {
      return { gateway_name: 'Razorpay / UPI India', is_configured: false, mode: 'SANDBOX' };
    }
  }
}
