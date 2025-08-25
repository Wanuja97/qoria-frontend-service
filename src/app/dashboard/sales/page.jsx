"use client"
import axios from 'axios';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { Calendar, TrendingUp, DollarSign, ShoppingCart, Users, Package, Award } from 'lucide-react';

export default function RevenuePage() {
  const [salesData, setSalesData] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Fetch available years from BE
  const fetchAvailableYears = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${apiUrl}/dashboard/filters/date-ranges`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (response.data?.data?.available_years?.length) {
        setAvailableYears(response.data.data.available_years.map(y => y.toString()));
        setSelectedYear(response.data.data.available_years[response.data.data.available_years.length - 1].toString()); // default to latest year
      }
    } catch (err) {
      console.error('Error fetching available years:', err);
      setError('Failed to load available years');
    }
  };

  // Fetch monthly sales data
  const fetchSalesData = async (year) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${apiUrl}/dashboard/monthly-sales?year=${year}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      setSalesData(response.data);
    } catch (err) {
      console.error('Error fetching sales data:', err);
      setError('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    const initialize = async () => {
      await fetchAvailableYears();
    };
    initialize();
  }, []);

  // Fetch sales data whenever selectedYear changes
  useEffect(() => {
    if (selectedYear) {
      fetchSalesData(selectedYear);
    }
  }, [selectedYear]);

  // Handle year selection
  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  };

  // Format large numbers
  const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num);

  // Format month names
  const formatMonth = (monthStr) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!salesData || !Array.isArray(salesData)) return [];
    return salesData
      .map(item => ({
        month: formatMonth(item.month),
        fullMonth: item.month,
        sales: item.total_sales / 1000000,
        volume: item.total_volume,
        transactions: item.transaction_count,
        customers: item.unique_customers,
        products: item.unique_products,
        avgTransaction: item.avg_transaction_value,
        rawSales: item.total_sales
      }))
      .sort((a, b) => new Date(a.fullMonth) - new Date(b.fullMonth));
  }, [salesData]);

  // Summary stats
  const summaryStats = useMemo(() => {
    if (!salesData || !Array.isArray(salesData) || salesData.length === 0) {
      return {
        totalSales: 0,
        totalVolume: 0,
        totalTransactions: 0,
        avgCustomersPerMonth: 0,
        highestSalesMonth: { total_sales: 0, month: '', total_volume: 0 },
        highestVolumeMonth: { total_volume: 0, month: '', total_sales: 0 }
      };
    }

    const totalSales = salesData.reduce((sum, item) => sum + item.total_sales, 0);
    const totalVolume = salesData.reduce((sum, item) => sum + item.total_volume, 0);
    const totalTransactions = salesData.reduce((sum, item) => sum + item.transaction_count, 0);
    const avgCustomersPerMonth = salesData.reduce((sum, item) => sum + item.unique_customers, 0) / salesData.length;

    const highestSalesMonth = salesData.reduce((max, item) => item.total_sales > max.total_sales ? item : max, salesData[0]);
    const highestVolumeMonth = salesData.reduce((max, item) => item.total_volume > max.total_volume ? item : max, salesData[0]);

    return { totalSales, totalVolume, totalTransactions, avgCustomersPerMonth, highestSalesMonth, highestVolumeMonth };
  }, [salesData]);

  // Bar color logic
  const getBarColor = (value, data) => {
    if (!data || data.length === 0) return '#8884d8';
    const maxValue = Math.max(...data.map(d => d.rawSales));
    const minValue = Math.min(...data.map(d => d.rawSales));
    const range = maxValue - minValue;
    if (range === 0) return '#3b82f6';
    const normalizedValue = (value - minValue) / range;
    if (normalizedValue > 0.8) return '#10b981';
    if (normalizedValue > 0.6) return '#3b82f6';
    if (normalizedValue > 0.4) return '#f59e0b';
    return '#ef4444';
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
      {/* <div className="p-6 space-y-6 bg-gray-50 min-h-screen"> */}
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Monthly Sales Analysis</h1>
        <p className="text-gray-600">Analyze monthly sales performance and identify peak revenue periods</p>
      </div>

      {/* Year Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Year Selection
          </CardTitle>
          <CardDescription>Select a year to view monthly sales performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <Select value={selectedYear} onValueChange={handleYearChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a year..." />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
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
            <CardTitle className="text-sm font-medium opacity-90">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryStats.totalSales)}</div>
            <p className="text-xs opacity-90 mt-1">
              Year {selectedYear} total revenue
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Volume</CardTitle>
            <Package className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summaryStats.totalVolume)}</div>
            <p className="text-xs opacity-90 mt-1">
              Units sold in {selectedYear}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Transactions</CardTitle>
            <ShoppingCart className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summaryStats.totalTransactions)}</div>
            <p className="text-xs opacity-90 mt-1">
              Total orders processed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Avg Customers</CardTitle>
            <Users className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(Math.round(summaryStats.avgCustomersPerMonth))}</div>
            <p className="text-xs opacity-90 mt-1">
              Average per month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Peak Performance Highlights */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Award className="h-5 w-5" />
              Highest Sales Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-800">
                {formatMonth(summaryStats.highestSalesMonth.month)} {selectedYear}
              </div>
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(summaryStats.highestSalesMonth.total_sales)}
              </div>
              <div className="text-sm text-green-700">
                {formatNumber(summaryStats.highestSalesMonth.transaction_count)} transactions • 
                {formatNumber(summaryStats.highestSalesMonth.unique_customers)} customers
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <TrendingUp className="h-5 w-5" />
              Highest Volume Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-800">
                {formatMonth(summaryStats.highestVolumeMonth.month)} {selectedYear}
              </div>
              <div className="text-lg font-semibold text-blue-600">
                {formatNumber(summaryStats.highestVolumeMonth.total_volume)} units
              </div>
              <div className="text-sm text-blue-700">
                {formatCurrency(summaryStats.highestVolumeMonth.total_sales)} revenue • 
                {formatNumber(summaryStats.highestVolumeMonth.unique_products)} products
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Revenue Chart */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Monthly Sales Performance - {selectedYear}</CardTitle>
              <CardDescription>
                Revenue and volume trends throughout the year (Sales in millions)
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {salesData ? salesData.length : 0} months of data
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  fontSize={12}
                />
                <YAxis 
                  fontSize={12}
                  label={{ value: 'Sales (Millions $)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-4 border rounded-lg shadow-lg">
                          <p className="font-medium mb-2">{label} {selectedYear}</p>
                          <p className="text-sm"><strong>Sales:</strong> {formatCurrency(data.rawSales)}</p>
                          <p className="text-sm"><strong>Volume:</strong> {formatNumber(data.volume)} units</p>
                          <p className="text-sm"><strong>Transactions:</strong> {formatNumber(data.transactions)}</p>
                          <p className="text-sm"><strong>Customers:</strong> {formatNumber(data.customers)}</p>
                          <p className="text-sm"><strong>Avg Transaction:</strong> {formatCurrency(data.avgTransaction)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fill="url(#salesGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Sales Volume Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Sales Volume Comparison</CardTitle>
          <CardDescription>
            Bar chart highlighting months with highest sales volume (Color indicates performance level)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  fontSize={12}
                />
                <YAxis 
                  fontSize={12}
                  label={{ value: 'Sales Volume (M$)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-4 border rounded-lg shadow-lg">
                          <p className="font-medium mb-2">{label} {selectedYear}</p>
                          <p className="text-sm"><strong>Revenue:</strong> {formatCurrency(data.rawSales)}</p>
                          <p className="text-sm"><strong>Volume:</strong> {formatNumber(data.volume)} units</p>
                          <p className="text-sm"><strong>Performance:</strong> {
                            data.rawSales === summaryStats.highestSalesMonth.total_sales ? 'Peak Month' :
                            (data.rawSales / Math.max(...chartData.map(d => d.rawSales))) > 0.8 ? 'Top Performer' :
                            (data.rawSales / Math.max(...chartData.map(d => d.rawSales))) > 0.6 ? 'Good Performance' :
                            'Average Performance'
                          }</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getBarColor(entry.rawSales, chartData)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Top Performers (80%+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Good (60-80%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Average (40-60%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Below Average (&lt;40%)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Monthly Data */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance Details</CardTitle>
          <CardDescription>
            Complete breakdown of sales metrics for {selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 font-medium text-gray-600">Month</th>
                  <th className="text-right py-3 font-medium text-gray-600">Sales Revenue</th>
                  <th className="text-right py-3 font-medium text-gray-600">Volume</th>
                  <th className="text-right py-3 font-medium text-gray-600">Transactions</th>
                  <th className="text-right py-3 font-medium text-gray-600">Customers</th>
                  <th className="text-right py-3 font-medium text-gray-600">Products</th>
                  <th className="text-right py-3 font-medium text-gray-600">Avg Transaction</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((item, index) => {
                  const isHighestSales = item.rawSales === summaryStats.highestSalesMonth.total_sales;
                  const isHighestVolume = item.volume === summaryStats.highestVolumeMonth.total_volume;
                  
                  return (
                    <tr key={item.month} className={`border-b hover:bg-gray-50 ${isHighestSales ? 'bg-green-50' : isHighestVolume ? 'bg-blue-50' : ''}`}>
                      <td className="py-3 font-medium">
                        <div className="flex items-center gap-2">
                          {item.month} {selectedYear}
                          {isHighestSales && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                              Peak Sales
                            </Badge>
                          )}
                          {isHighestVolume && !isHighestSales && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                              Peak Volume
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-right font-semibold text-green-600">
                        {formatCurrency(item.rawSales)}
                      </td>
                      <td className="py-3 text-right font-medium">
                        {formatNumber(item.volume)}
                      </td>
                      <td className="py-3 text-right">
                        {formatNumber(item.transactions)}
                      </td>
                      <td className="py-3 text-right">
                        {formatNumber(item.customers)}
                      </td>
                      <td className="py-3 text-right">
                        {formatNumber(item.products)}
                      </td>
                      <td className="py-3 text-right font-medium">
                        {formatCurrency(item.avgTransaction)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 pt-4 border-t">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <strong>Selected Year:</strong> {selectedYear}
          </div>
          <div>
            <strong>Data Points:</strong> {salesData ? salesData.length : 0} months
          </div>
          <div>
            <strong>Peak Month:</strong> {formatMonth(summaryStats.highestSalesMonth.month)}
          </div>
        </div>
      </div>
    </div>
  );
}