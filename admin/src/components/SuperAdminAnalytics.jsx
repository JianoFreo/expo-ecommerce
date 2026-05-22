import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C"];

const SuperAdminAnalytics = ({ stats, ordersData = [], usersData = [] }) => {
  // Generate seller activity data
  const generateSellerActivityData = () => {
    const sellerMap = {};
    
    ordersData.forEach((order) => {
      // Group orders by seller (shop)
      const shopName = order.shop?.name || "Unknown Seller";
      if (!sellerMap[shopName]) {
        sellerMap[shopName] = {
          name: shopName,
          orders: 0,
          revenue: 0,
          items: 0,
        };
      }
      sellerMap[shopName].orders += 1;
      sellerMap[shopName].revenue += order.totalPrice || 0;
      sellerMap[shopName].items += order.orderItems?.length || 0;
    });

    return Object.values(sellerMap).slice(0, 10); // Top 10 sellers
  };

  // Generate order status distribution
  const generateOrderStatusData = () => {
    const statusMap = {
      pending: 0,
      shipped: 0,
      delivered: 0,
    };

    ordersData.forEach((order) => {
      statusMap[order.status || "pending"]++;
    });

    return Object.entries(statusMap).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
    }));
  };

  // Generate revenue trend over time
  const generateRevenueTrend = () => {
    const data = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      const dayOrders = ordersData.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return (
          orderDate.getDate() === date.getDate() &&
          orderDate.getMonth() === date.getMonth() &&
          orderDate.getFullYear() === date.getFullYear()
        );
      });

      const revenue = dayOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
      const count = dayOrders.length;

      data.push({
        date: dateStr,
        revenue: parseFloat(revenue.toFixed(2)),
        orders: count,
      });
    }

    return data;
  };

  const sellerActivityData = generateSellerActivityData();
  const orderStatusData = generateOrderStatusData();
  const revenueTrend = generateRevenueTrend();

  return (
    <div className="space-y-6">
      {/* SELLER ACTIVITY - ORDERS & REVENUE BY SELLER */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body space-y-4">
          <h3 className="card-title">Top Sellers Activity</h3>
          
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={sellerActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#999" angle={-45} textAnchor="end" height={100} />
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
              <Bar yAxisId="left" dataKey="orders" fill="#0088FE" name="Orders" radius={[8, 8, 0, 0]} />
              <Bar yAxisId="right" dataKey="revenue" fill="#00C49F" name="Revenue ($)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PLATFORM REVENUE TREND */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body space-y-4">
          <h3 className="card-title">Platform Revenue & Orders Trend (Last 7 Days)</h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueTrend}>
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
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="Revenue ($)"
                dot={{ fill: "#8b5cf6" }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                stroke="#06b6d4"
                strokeWidth={2}
                name="Orders"
                dot={{ fill: "#06b6d4" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ORDER STATUS DISTRIBUTION */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body space-y-4">
          <h3 className="card-title">Order Status Distribution</h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KEY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <div className="stat-title">Active Sellers</div>
          <div className="stat-value text-warning">{sellerActivityData.length}</div>
          <div className="stat-desc">Selling now</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-title">Total Users</div>
          <div className="stat-value text-info">{usersData?.length || 0}</div>
          <div className="stat-desc">Registered users</div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminAnalytics;
