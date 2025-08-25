"use client"

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ScatterChart, Scatter } from 'recharts';
import { MapPin, DollarSign, ShoppingCart, Users, Globe, Award, Target } from 'lucide-react';

export default function RevenuePage() {
  const [countries, setCountries] = useState([]);
  const [regionsData, setRegionsData] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [loading, setLoading] = useState(true);
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Memoized country options for dropdown
  const countryOptions = useMemo(() => {
    return [
      { value: 'all', label: 'All Countries' },
      ...countries.map(country => ({
        value: country.country,
        label: country.country
      }))
    ];
  }, [countries]);

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await axios.get(`${apiUrl}/dashboard/filters/countries`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          }
        });

        if (response.data.status === 'success') {
          setCountries(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching countries:', err);
        setError('Failed to load countries');
      }
    };

    fetchCountries();
  }, []);

  // Fetch regions data
  const fetchRegionsData = async (country = '') => {
    try {
      setRegionsLoading(true);
      const token = localStorage.getItem('authToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.get(
        `${apiUrl}/dashboard/top-regions?limit=30&country=${country}`,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          }
        }
      );

      setRegionsData(response.data || []);
    } catch (err) {
      console.error('Error fetching regions data:', err);
      setError('Failed to load regions data');
    } finally {
      setRegionsLoading(false);
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchRegionsData('');
  }, []);

  // Handle country selection
  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    const apiCountry = country === 'all' ? '' : country;
    fetchRegionsData(apiCountry);
  };

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
  const chartData = useMemo(() => {
    if (!regionsData || !Array.isArray(regionsData)) {
      return [];
    }

    return regionsData.map((region, index) => ({
      name: region.region.length > 12 ? `${region.region.substring(0, 12)}...` : region.region,
      fullName: region.region,
      country: region.country,
      revenue: region.total_revenue / 1000000, // Convert to millions
      rawRevenue: region.total_revenue,
      itemsSold: region.items_sold,
      transactions: region.transaction_count,
      customers: region.unique_customers,
      products: region.unique_products,
      avgTransaction: region.avg_transaction_value,
      rank: region.revenue_rank || index + 1,
      revenuePerCustomer: region.total_revenue / region.unique_customers,
      efficiency: (region.total_revenue / region.transaction_count) // Revenue per transaction
    }));
  }, [regionsData]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!regionsData || !Array.isArray(regionsData) || regionsData.length === 0) {
      return {
        totalRevenue: 0,
        totalItemsSold: 0,
        totalTransactions: 0,
        totalCustomers: 0,
        avgRevenuePerRegion: 0,
        topRegion: { region: '', country: '', total_revenue: 0 },
        topCountryByRegions: { country: '', count: 0 }
      };
    }

    const totalRevenue = regionsData.reduce((sum, item) => sum + item.total_revenue, 0);
    const totalItemsSold = regionsData.reduce((sum, item) => sum + item.items_sold, 0);
    const totalTransactions = regionsData.reduce((sum, item) => sum + item.transaction_count, 0);
    const totalCustomers = regionsData.reduce((sum, item) => sum + item.unique_customers, 0);
    const avgRevenuePerRegion = totalRevenue / regionsData.length;

    const topRegion = regionsData[0] || { region: '', country: '', total_revenue: 0 };

    // Find country with most regions in top 30
    const countryRegionCount = regionsData.reduce((acc, region) => {
      acc[region.country] = (acc[region.country] || 0) + 1;
      return acc;
    }, {});

    const topCountryByRegions = Object.entries(countryRegionCount)
      .reduce((max, [country, count]) => count > max.count ? { country, count } : max, { country: '', count: 0 });

    return {
      totalRevenue,
      totalItemsSold,
      totalTransactions,
      totalCustomers,
      avgRevenuePerRegion,
      topRegion,
      topCountryByRegions
    };
  }, [regionsData]);

  // Country colors for charts
  const countryColors = {
    'USA': '#3b82f6',
    'Australia': '#10b981', 
    'Canada': '#f59e0b',
    'Germany': '#ef4444',
    'UK': '#8b5cf6',
    'India': '#06b6d4'
  };

  // Get color for region based on country
  const getRegionColor = (country) => {
    return countryColors[country] || '#6b7280';
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
        <h1 className="text-3xl font-bold tracking-tight">Top 30 Regions by Revenue</h1>
        <p className="text-gray-600">
          Analyze the highest performing regions worldwide with revenue and sales volume insights
        </p>
      </div>

      {/* Country Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Country Filter
          </CardTitle>
          <CardDescription>
            Filter regions by country or view all top-performing regions globally
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <Select value={selectedCountry} onValueChange={handleCountryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a country..." />
              </SelectTrigger>
              <SelectContent>
                {countryOptions.map((option) => (
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
            <CardTitle className="text-sm font-medium opacity-90">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryStats.totalRevenue)}</div>
            <p className="text-xs opacity-90 mt-1">
              From top {regionsData ? regionsData.length : 0} regions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Items Sold</CardTitle>
            <ShoppingCart className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summaryStats.totalItemsSold)}</div>
            <p className="text-xs opacity-90 mt-1">
              Total units sold
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Transactions</CardTitle>
            <Target className="h-4 w-4 opacity-90" />
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
            <CardTitle className="text-sm font-medium opacity-90">Customers</CardTitle>
            <Users className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summaryStats.totalCustomers)}</div>
            <p className="text-xs opacity-90 mt-1">
              Unique customers served
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performance Highlights */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Award className="h-5 w-5" />
              #1 Revenue Region
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-800">
                {summaryStats.topRegion.region}
              </div>
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(summaryStats.topRegion.total_revenue)}
              </div>
              <div className="text-sm text-green-700">
                {summaryStats.topRegion.country} • Rank #1
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <MapPin className="h-5 w-5" />
              Most Represented Country
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-800">
                {summaryStats.topCountryByRegions.country}
              </div>
              <div className="text-lg font-semibold text-blue-600">
                {summaryStats.topCountryByRegions.count} regions
              </div>
              <div className="text-sm text-blue-700">
                In top 30 performers
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Revenue Chart */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>
                Top Regions by Revenue
                {selectedCountry && selectedCountry !== 'all' && ` - ${selectedCountry}`}
              </CardTitle>
              <CardDescription>
                Revenue performance across regions (in millions USD)
                {selectedCountry && selectedCountry !== 'all' ? ` filtered by ${selectedCountry}` : ' - all countries'}
              </CardDescription>
            </div>
            {selectedCountry && selectedCountry !== 'all' && (
              <Badge variant="secondary" className="ml-4">
                Filtered: {selectedCountry}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {regionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="h-[600px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={120}
                    fontSize={11}
                  />
                  <YAxis 
                    label={{ value: 'Revenue (Millions USD)', angle: -90, position: 'insideLeft' }}
                    fontSize={12}
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-4 border rounded-lg shadow-lg">
                            <p className="font-medium mb-2">{data.fullName}, {data.country}</p>
                            <p className="text-sm"><strong>Rank:</strong> #{data.rank}</p>
                            <p className="text-sm"><strong>Revenue:</strong> {formatCurrency(data.rawRevenue)}</p>
                            <p className="text-sm"><strong>Items Sold:</strong> {formatNumber(data.itemsSold)}</p>
                            <p className="text-sm"><strong>Transactions:</strong> {formatNumber(data.transactions)}</p>
                            <p className="text-sm"><strong>Customers:</strong> {formatNumber(data.customers)}</p>
                            <p className="text-sm"><strong>Avg Transaction:</strong> {formatCurrency(data.avgTransaction)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`revenue-${index}`} 
                        fill={getRegionColor(entry.country)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Items Sold Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Items Sold by Region</CardTitle>
          <CardDescription>
            Sales volume across top performing regions (Color represents country)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={120}
                  fontSize={11}
                />
                <YAxis 
                  label={{ value: 'Items Sold', angle: -90, position: 'insideLeft' }}
                  fontSize={12}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-4 border rounded-lg shadow-lg">
                          <p className="font-medium mb-2">{data.fullName}, {data.country}</p>
                          <p className="text-sm"><strong>Items Sold:</strong> {formatNumber(data.itemsSold)}</p>
                          <p className="text-sm"><strong>Revenue:</strong> {formatCurrency(data.rawRevenue)}</p>
                          <p className="text-sm"><strong>Revenue per Item:</strong> {formatCurrency(data.rawRevenue / data.itemsSold)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="itemsSold" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`items-${index}`} 
                      fill={getRegionColor(entry.country)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Revenue vs Items Sold Scatter Plot */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Items Sold Analysis</CardTitle>
          <CardDescription>
            Relationship between revenue and items sold (Each point represents a region)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="itemsSold" 
                  name="Items Sold"
                  label={{ value: 'Items Sold', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  dataKey="revenue" 
                  name="Revenue"
                  label={{ value: 'Revenue (M$)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-4 border rounded-lg shadow-lg">
                          <p className="font-medium mb-2">{data.fullName}, {data.country}</p>
                          <p className="text-sm"><strong>Revenue:</strong> {formatCurrency(data.rawRevenue)}</p>
                          <p className="text-sm"><strong>Items Sold:</strong> {formatNumber(data.itemsSold)}</p>
                          <p className="text-sm"><strong>Revenue per Item:</strong> {formatCurrency(data.rawRevenue / data.itemsSold)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter dataKey="revenue">
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`scatter-${index}`} 
                      fill={getRegionColor(entry.country)}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Country Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Country Color Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(countryColors).map(([country, color]) => (
              <div key={country} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: color }}
                ></div>
                <span className="text-sm font-medium">{country}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Regions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Performance Details</CardTitle>
          <CardDescription>
            Complete breakdown of top 30 regions by revenue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 font-medium text-gray-600">Rank</th>
                  <th className="text-left py-3 font-medium text-gray-600">Region</th>
                  <th className="text-left py-3 font-medium text-gray-600">Country</th>
                  <th className="text-right py-3 font-medium text-gray-600">Revenue</th>
                  <th className="text-right py-3 font-medium text-gray-600">Items Sold</th>
                  <th className="text-right py-3 font-medium text-gray-600">Transactions</th>
                  <th className="text-right py-3 font-medium text-gray-600">Customers</th>
                  <th className="text-right py-3 font-medium text-gray-600">Avg Transaction</th>
                </tr>
              </thead>
              <tbody>
                {regionsData.map((region, index) => (
                  <tr key={`${region.region}-${region.country}`} className={`border-b hover:bg-gray-50 ${index < 3 ? 'bg-yellow-50' : ''}`}>
                    <td className="py-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-white rounded-full ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-500' : 
                        'bg-blue-500'
                      }`}>
                        {region.revenue_rank || index + 1}
                      </span>
                    </td>
                    <td className="py-3 font-medium">
                      {region.region}
                      {index < 3 && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Top {index + 1}
                        </Badge>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getRegionColor(region.country) }}
                        ></div>
                        <span className="font-medium">{region.country}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right font-semibold text-green-600">
                      {formatCurrency(region.total_revenue)}
                    </td>
                    <td className="py-3 text-right font-medium">
                      {formatNumber(region.items_sold)}
                    </td>
                    <td className="py-3 text-right">
                      {formatNumber(region.transaction_count)}
                    </td>
                    <td className="py-3 text-right">
                      {formatNumber(region.unique_customers)}
                    </td>
                    <td className="py-3 text-right font-medium">
                      {formatCurrency(region.avg_transaction_value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 pt-4 border-t">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <strong>Regions Shown:</strong> {regionsData ? regionsData.length : 0}
          </div>
          <div>
            <strong>Current Filter:</strong> {selectedCountry === 'all' ? 'All Countries' : selectedCountry}
          </div>
          <div>
            <strong>Top Region:</strong> {summaryStats.topRegion.region}
          </div>
          <div>
            <strong>Avg Revenue:</strong> {formatCurrency(summaryStats.avgRevenuePerRegion)}
          </div>
        </div>
      </div>
    </div>
  );
}