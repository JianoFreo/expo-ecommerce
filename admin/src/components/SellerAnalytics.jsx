import React from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const SellerAnalytics = ({ stats, recentOrders = [] }) => {
  // Generate data for orders over last 7 days
  const generateOrdersData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      // Count orders for this date from recentOrders
      const ordersCount = recentOrders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return (
          orderDate.getDate() === date.getDate() &&
          orderDate.getMonth() === date.getMonth() &&
          orderDate.getFullYear() === date.getFullYear()
        );
      }).length;
      
      const revenue = recentOrders
        .filter((order) => {
          const orderDate = new Date(order.createdAt);
          return (
            orderDate.getDate() === date.getDate() &&
            orderDate.getMonth() === date.getMonth() &&
            orderDate.getFullYear() === date.getFullYear()
          );
        })
        .reduce((sum, order) => sum + (order.revenue || 0), 0);

      data.push({
        date: dateStr,
        orders: ordersCount,
        revenue: parseFloat(revenue.toFixed(2)),
      });
    }
    return data;
  };

  const ordersData = generateOrdersData();

  // Generate product categories data (mock - would come from real data)
  const categoryData = [
    { name: "Electronics", sales: Math.floor(Math.random() * 50) + 10 },
    { name: "Fashion", sales: Math.floor(Math.random() * 50) + 10 },
    { name: "Sports", sales: Math.floor(Math.random() * 50) + 10 },
    { name: "Books", sales: Math.floor(Math.random() * 50) + 10 },
  ];

  return (
    <div className="space-y-6">
      {/* ORDERS & REVENUE TREND */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body space-y-4">
          <h3 className="card-title">Orders & Revenue Trend (Last 7 Days)</h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={ordersData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#999" />
              <YAxis yAxisId="left" stroke="#999" />
              <YAxis yAxisId="right" orientation="right" stroke="#999" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#8b5cf6"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Revenue ($)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                stroke="#10b981"
                strokeWidth={2}
                name="Orders Count"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SALES BY CATEGORY */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body space-y-4">
          <h3 className="card-title">Sales by Category</h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend />
              <Bar dataKey="sales" fill="#06b6d4" name="Units Sold" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KEY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-title">Total Orders</div>
          <div className="stat-value text-primary">{stats?.totalOrders || 0}</div>
          <div className="stat-desc">All time</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-title">Total Revenue</div>
          <div className="stat-value text-success">${(stats?.totalRevenue || 0).toFixed(2)}</div>
          <div className="stat-desc">All time</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-title">Items Sold</div>
          <div className="stat-value text-warning">{stats?.totalItemsSold || 0}</div>
          <div className="stat-desc">All time</div>
        </div>
      </div>
    </div>
  );
};

export default SellerAnalytics;
