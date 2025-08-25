"use client"
import axios from 'axios';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Package, Globe, DollarSign, ShoppingCart } from 'lucide-react';

export default function OverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  const fetchData = async () => {
    try {
      // Get bearer token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.get(`${apiUrl}/dashboard/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Error loading dashboard data: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) return null;

  const { summary, top_products, recent_sales, top_regions } = data;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format large numbers
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Prepare chart data
  const salesChartData = recent_sales.map(item => ({
    month: item.month,
    sales: item.total_sales / 1000000, // Convert to millions
    volume: item.total_volume,
    customers: item.unique_customers
  }));

  const regionChartData = top_regions.slice(0, 8).map(region => ({
    name: region.region,
    revenue: region.total_revenue / 1000000,
    country: region.country
  }));

  const categoryData = top_products.reduce((acc, product) => {
    const existing = acc.find(item => item.category === product.category);
    if (existing) {
      existing.revenue += product.total_revenue;
      existing.count += 1;
    } else {
      acc.push({
        category: product.category,
        revenue: product.total_revenue,
        count: 1
      });
    }
    return acc;
  }, []);

  const pieColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-gray-600">
          Comprehensive view of your business performance and metrics
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.grand_total_revenue)}</div>
            <p className="text-xs opacity-90 mt-1">
              Avg: {formatCurrency(summary.avg_transaction_value)} per transaction
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Users</CardTitle>
            <Users className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summary.total_users)}</div>
            <p className="text-xs opacity-90 mt-1">
              {formatNumber(summary.total_transactions)} transactions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Products</CardTitle>
            <Package className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summary.total_products)}</div>
            <p className="text-xs opacity-90 mt-1">
              {formatNumber(summary.total_quantity)} total sold
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Global Reach</CardTitle>
            <Globe className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_countries} Countries</div>
            <p className="text-xs opacity-90 mt-1">
              {summary.total_regions} regions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Sales Trend (Last 6 Months)
            </CardTitle>
            <CardDescription>Monthly sales performance in millions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'sales' ? `$${value.toFixed(1)}M` : formatNumber(value),
                      name === 'sales' ? 'Sales' : name === 'volume' ? 'Volume' : 'Customers'
                    ]}
                  />
                  <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} />
                  <Line type="monotone" dataKey="customers" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Regions Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Regions</CardTitle>
            <CardDescription>Revenue by region (millions)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionChartData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip 
                    formatter={(value) => [`$${value.toFixed(1)}M`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution and Top Products */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Category Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
            <CardDescription>Distribution across product categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="revenue"
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Products Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Top Performing Products
            </CardTitle>
            <CardDescription>Best selling products by quantity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-gray-600">Rank</th>
                    <th className="text-left py-2 font-medium text-gray-600">Product</th>
                    <th className="text-left py-2 font-medium text-gray-600">Category</th>
                    <th className="text-right py-2 font-medium text-gray-600">Sold</th>
                    <th className="text-right py-2 font-medium text-gray-600">Revenue</th>
                    <th className="text-right py-2 font-medium text-gray-600">Avg Price</th>
                    <th className="text-right py-2 font-medium text-gray-600">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {top_products.slice(0, 10).map((product, index) => (
                    <tr key={product.product_id} className="border-b hover:bg-gray-50">
                      <td className="py-3">
                        <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-white bg-blue-500 rounded-full">
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-3 font-medium">{product.product_name}</td>
                      <td className="py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          product.category === 'Electronics' ? 'bg-blue-100 text-blue-800' :
                          product.category === 'Home' ? 'bg-green-100 text-green-800' :
                          product.category === 'Clothing' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {product.category}
                        </span>
                      </td>
                      <td className="py-3 text-right font-medium">{product.total_purchased}</td>
                      <td className="py-3 text-right font-medium">{formatCurrency(product.total_revenue)}</td>
                      <td className="py-3 text-right">{formatCurrency(product.avg_price)}</td>
                      <td className="py-3 text-right">
                        <span className={`font-medium ${product.current_stock < 50 ? 'text-red-600' : 'text-green-600'}`}>
                          {product.current_stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regional Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Performance</CardTitle>
          <CardDescription>Top performing regions by revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium text-gray-600">Rank</th>
                  <th className="text-left py-2 font-medium text-gray-600">Region</th>
                  <th className="text-left py-2 font-medium text-gray-600">Country</th>
                  <th className="text-right py-2 font-medium text-gray-600">Revenue</th>
                  <th className="text-right py-2 font-medium text-gray-600">Customers</th>
                  <th className="text-right py-2 font-medium text-gray-600">Transactions</th>
                  <th className="text-right py-2 font-medium text-gray-600">Avg Order</th>
                </tr>
              </thead>
              <tbody>
                {top_regions.slice(0, 10).map((region, index) => (
                  <tr key={region.region} className="border-b hover:bg-gray-50">
                    <td className="py-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-white bg-green-500 rounded-full">
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 font-medium">{region.region}</td>
                    <td className="py-3">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {region.country}
                      </span>
                    </td>
                    <td className="py-3 text-right font-medium">{formatCurrency(region.total_revenue)}</td>
                    <td className="py-3 text-right">{formatNumber(region.unique_customers)}</td>
                    <td className="py-3 text-right">{formatNumber(region.transaction_count)}</td>
                    <td className="py-3 text-right">{formatCurrency(region.avg_transaction_value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Sales Detail */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Sales Analysis</CardTitle>
          <CardDescription>Detailed breakdown of recent sales performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recent_sales.map((month, index) => (
              <div key={month.month} className="p-4 rounded-lg border bg-white">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-lg">{month.month}</h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {formatNumber(month.transaction_count)} orders
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Revenue:</span>
                    <span className="font-medium">{formatCurrency(month.total_sales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Volume:</span>
                    <span className="font-medium">{formatNumber(month.total_volume)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customers:</span>
                    <span className="font-medium">{formatNumber(month.unique_customers)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Products:</span>
                    <span className="font-medium">{formatNumber(month.unique_products)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600">Avg Order:</span>
                    <span className="font-semibold text-blue-600">{formatCurrency(month.avg_transaction_value)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Business Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">First Transaction:</span>
              <span className="font-medium">
                {new Date(summary.earliest_transaction).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Latest Transaction:</span>
              <span className="font-medium">
                {new Date(summary.latest_transaction).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="text-gray-600">Active Period:</span>
              <span className="font-medium">
                {Math.round((new Date(summary.latest_transaction) - new Date(summary.earliest_transaction)) / (1000 * 60 * 60 * 24 * 365 * 100)) / 100} years
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Orders per User:</span>
              <span className="font-medium">
                {(summary.total_transactions / summary.total_users).toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Items per Order:</span>
              <span className="font-medium">
                {(summary.total_quantity / summary.total_transactions).toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="text-gray-600">Revenue per User:</span>
              <span className="font-medium">
                {formatCurrency(summary.grand_total_revenue / summary.total_users)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inventory Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Products in Catalog:</span>
              <span className="font-medium">{formatNumber(summary.total_products)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Low Stock Items:</span>
              <span className="font-medium text-red-600">
                {top_products.filter(p => p.current_stock < 50).length}
              </span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="text-gray-600">Avg Product Price:</span>
              <span className="font-medium">
                {formatCurrency(top_products.reduce((sum, p) => sum + p.avg_price, 0) / top_products.length)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 pt-4 border-t">
        Last updated: {new Date(data.generated_at).toLocaleString()}
      </div>
    </div>
  );
}