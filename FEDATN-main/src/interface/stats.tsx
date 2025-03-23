export interface ProductStats {
    totalProducts: number;
    activeProducts: number;
    totalVariants: number;
    totalStock: number;
  }
  
  export interface OrderStats {
    totalOrders: number;
    pendingOrders: number;
    packagingOrders: number; // Add this
    completedOrders: number;
    canceledOrders: number;
  }
  
  export interface RevenueStats {
    totalRevenue: number;
    averageOrderValue: number;
  }
  
  export interface Stats {
    products: ProductStats;
    orders: OrderStats;
    revenue: RevenueStats;
  }