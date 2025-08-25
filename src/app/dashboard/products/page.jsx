"use client"
import axios from 'axios';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Package, TrendingUp, ShoppingCart, Filter, AlertTriangle } from 'lucide-react';

export default function ProductsPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Memoized category options for dropdown
  const categoryOptions = useMemo(() => {
    return [
      { value: 'all', label: 'All Categories' },
      ...categories.map(category => ({
        value: category.category,
        label: category.category
      }))
    ];
  }, [categories]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await axios.get(`${apiUrl}/dashboard/filters/categories`, {
        headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
        }
        });

        if (response.data.status === 'success') {
        setCategories(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  // Fetch products data
  const fetchProducts = async (category = '') => {
    try {
      setProductsLoading(true);
      const token = localStorage.getItem('authToken');
         const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await axios.get(
    `${apiUrl}/dashboard/top-products?limit=20&category=${category}`,
    {
        headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
        }
    }
    );

    setProducts(response.data);

    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products data');
    } finally {
      setProductsLoading(false);
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchProducts('');
  }, []);

  // Handle category selection
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    const apiCategory = category === 'all' ? '' : category;
    fetchProducts(apiCategory);
  };

  // Format numbers
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    return products.map((product, index) => ({
      name: `${product.product_name.substring(0, 15)}...`,
      fullName: product.product_name,
      purchased: product.total_purchased,
      stock: product.current_stock,
      revenue: product.total_revenue,
      category: product.category,
      rank: product.popularity_rank || index + 1,
      isLowStock: product.current_stock < 100
    }));
  }, [products]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalPurchased = products.reduce((sum, item) => sum + item.total_purchased, 0);
    const totalRevenue = products.reduce((sum, item) => sum + item.total_revenue, 0);
    const totalStock = products.reduce((sum, item) => sum + item.current_stock, 0);
    const lowStockCount = products.filter(item => item.current_stock < 100).length;

    return {
      totalPurchased,
      totalRevenue,
      totalStock,
      lowStockCount
    };
  }, [products]);

  // Colors for different categories
  const categoryColors = {
    'Electronics': '#3b82f6',
    'Clothing': '#ef4444',
    'Home': '#10b981',
    'Books': '#f59e0b',
    'Toys': '#8b5cf6'
  };

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
            Error loading data: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Top 20 Products</h1>
        <p className="text-gray-600">
          Most frequently purchased products with current stock levels
        </p>
      </div>

      {/* Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Category Filter
          </CardTitle>
          <CardDescription>
            Filter products by category to see top performers in each segment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category..." />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Purchased</CardTitle>
            <ShoppingCart className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summaryStats.totalPurchased)}</div>
            <p className="text-xs opacity-90 mt-1">
              Units sold across top 20 products
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryStats.totalRevenue)}</div>
            <p className="text-xs opacity-90 mt-1">
              Revenue from top 20 products
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Available Stock</CardTitle>
            <Package className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summaryStats.totalStock)}</div>
            <p className="text-xs opacity-90 mt-1">
              Total units in inventory
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Low Stock Alert</CardTitle>
            <AlertTriangle className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.lowStockCount}</div>
            <p className="text-xs opacity-90 mt-1">
              Products with &lt;100 units
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>
                Top 20 Products by Purchase Frequency
                {selectedCategory && selectedCategory !== 'all' && ` - ${selectedCategory}`}
              </CardTitle>
              <CardDescription>
                Units purchased vs. current stock levels
                {selectedCategory && selectedCategory !== 'all' ? ` in ${selectedCategory} category` : ' across all categories'}
              </CardDescription>
            </div>
            {selectedCategory && selectedCategory !== 'all' && (
              <Badge variant="secondary" className="ml-4">
                Filtered: {selectedCategory}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {productsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="h-[600px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-4 border rounded-lg shadow-lg">
                            <p className="font-medium mb-2">{data.fullName}</p>
                            <p className="text-sm"><strong>Category:</strong> {data.category}</p>
                            <p className="text-sm"><strong>Rank:</strong> #{data.rank}</p>
                            <p className="text-sm"><strong>Purchased:</strong> {formatNumber(data.purchased)} units</p>
                            <p className="text-sm"><strong>Current Stock:</strong> {formatNumber(data.stock)} units</p>
                            <p className="text-sm"><strong>Revenue:</strong> {formatCurrency(data.revenue)}</p>
                            {data.isLowStock && (
                              <p className="text-sm text-red-600 mt-1">
                                <AlertTriangle className="h-3 w-3 inline mr-1" />
                                Low Stock Alert!
                              </p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="purchased" name="Units Purchased" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`purchased-${index}`} 
                        fill={categoryColors[entry.category] || '#8884d8'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Level Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Current Stock Levels</CardTitle>
          <CardDescription>
            Available inventory for top 20 products (Red bars indicate low stock &lt;100 units)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-4 border rounded-lg shadow-lg">
                          <p className="font-medium mb-2">{data.fullName}</p>
                          <p className="text-sm"><strong>Current Stock:</strong> {formatNumber(data.stock)} units</p>
                          <p className="text-sm"><strong>Category:</strong> {data.category}</p>
                          {data.isLowStock && (
                            <p className="text-sm text-red-600 mt-1">
                              <AlertTriangle className="h-3 w-3 inline mr-1" />
                              Low Stock Alert!
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="stock" name="Current Stock" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`stock-${index}`} 
                      fill={entry.isLowStock ? '#ef4444' : '#10b981'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            Complete information for top 20 products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 font-medium text-gray-600">Rank</th>
                  <th className="text-left py-3 font-medium text-gray-600">Product</th>
                  <th className="text-left py-3 font-medium text-gray-600">Category</th>
                  <th className="text-right py-3 font-medium text-gray-600">Purchased</th>
                  <th className="text-right py-3 font-medium text-gray-600">Revenue</th>
                  <th className="text-right py-3 font-medium text-gray-600">Avg Price</th>
                  <th className="text-right py-3 font-medium text-gray-600">Stock</th>
                  <th className="text-right py-3 font-medium text-gray-600">Transactions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={product.product_id} className="border-b hover:bg-gray-50">
                    <td className="py-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-white bg-blue-500 rounded-full">
                        {product.popularity_rank || index + 1}
                      </span>
                    </td>
                    <td className="py-3 font-medium max-w-xs">
                      <div className="truncate" title={product.product_name}>
                        {product.product_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {product.product_id}
                      </div>
                    </td>
                    <td className="py-3">
                      <span 
                        className="inline-flex px-2 py-1 text-xs font-medium rounded-full text-white"
                        style={{ backgroundColor: categoryColors[product.category] || '#6b7280' }}
                      >
                        {product.category}
                      </span>
                    </td>
                    <td className="py-3 text-right font-semibold text-blue-600">
                      {formatNumber(product.total_purchased)}
                    </td>
                    <td className="py-3 text-right font-semibold text-green-600">
                      {formatCurrency(product.total_revenue)}
                    </td>
                    <td className="py-3 text-right">
                      {formatCurrency(product.avg_price)}
                    </td>
                    <td className="py-3 text-right">
                      <span className={`font-medium ${
                        product.current_stock < 100 ? 'text-red-600' : 
                        product.current_stock < 500 ? 'text-yellow-600' : 
                        'text-green-600'
                      }`}>
                        {formatNumber(product.current_stock)}
                        {product.current_stock < 100 && (
                          <AlertTriangle className="h-3 w-3 inline ml-1" />
                        )}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {formatNumber(product.transaction_count)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Category Summary */}
      {selectedCategory === 'all' && (
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>
              Number of products in top 20 by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map(category => {
                const categoryCount = products.filter(p => p.category === category.category).length;
                const categoryRevenue = products
                  .filter(p => p.category === category.category)
                  .reduce((sum, p) => sum + p.total_revenue, 0);
                
                return (
                  <div key={category.category} className="p-4 rounded-lg border bg-white">
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: categoryColors[category.category] || '#6b7280' }}
                      ></div>
                      <h4 className="font-semibold text-sm">{category.category}</h4>
                    </div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <p><strong>{categoryCount}</strong> products</p>
                      <p><strong>{formatCurrency(categoryRevenue)}</strong> revenue</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer Info */}
      <div className="text-center text-sm text-gray-500 pt-4 border-t">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <strong>Total Categories:</strong> {categories.length}
          </div>
          <div>
            <strong>Current Filter:</strong> {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
          </div>
          <div>
            <strong>Products Shown:</strong> {products.length}
          </div>
        </div>
      </div>
    </div>
  );
}