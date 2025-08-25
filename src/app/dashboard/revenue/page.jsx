"use client"

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Globe } from 'lucide-react';

export default function RevenuePage() {
  const [countries, setCountries] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [loading, setLoading] = useState(true);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total_count: 0,
    has_more: false
  });

  // Memoized countries for dropdown options
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

  // Fetch revenue data
  const fetchRevenueData = async (country = '', page = 1, limit = 50) => {
    try {
      setRevenueLoading(true);
      const token = localStorage.getItem('authToken');
         const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.get(
        `${apiUrl}/dashboard/country-revenue?page=${page}&limit=${limit}&country=${country}`,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
          data: {
            email: "wanuja@example.com",
            password: "securePassword123"
          }
        }
      );

      setRevenueData(response.data.data);
      setPagination({
        page: response.data.page,
        limit: response.data.limit,
        total_count: response.data.total_count,
        has_more: response.data.has_more
      });
    } catch (err) {
      console.error('Error fetching revenue data:', err);
      setError('Failed to load revenue data');
    } finally {
      setRevenueLoading(false);
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchRevenueData('', 1, 50);
  }, []);

  // Handle country selection
  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    setPagination(prev => ({ ...prev, page: 1 }));
    const apiCountry = country === 'all' ? '' : country;
    fetchRevenueData(apiCountry, 1, 50);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    const apiCountry = selectedCountry === 'all' ? '' : selectedCountry;
    fetchRevenueData(apiCountry, newPage, pagination.limit);
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

  // Format large numbers
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

//   // Calculate summary statistics
//   const summaryStats = useMemo(() => {
//     const totalRevenue = revenueData.reduce((sum, item) => sum + item.total_revenue, 0);
//     const totalTransactions = revenueData.reduce((sum, item) => sum + item.transaction_count, 0);
//     const totalQuantity = revenueData.reduce((sum, item) => sum + item.total_quantity, 0);
//     const avgPrice = revenueData.length > 0 
//       ? revenueData.reduce((sum, item) => sum + item.avg_price, 0) / revenueData.length 
//       : 0;

//     return {
//       totalRevenue,
//       totalTransactions,
//       totalQuantity,
//       avgPrice
//     };
//   }, [revenueData]);

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
        <h1 className="text-3xl font-bold tracking-tight">Country-Level Revenue Analysis</h1>
        <p className="text-gray-600">
          Analyze revenue performance across different countries and products
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
            Select a country to filter revenue data, or view all countries
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
      {/* <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryStats.totalRevenue)}</div>
            <p className="text-xs opacity-90 mt-1">
              From {revenueData.length} products
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Transactions</CardTitle>
            <ShoppingCart className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summaryStats.totalTransactions)}</div>
            <p className="text-xs opacity-90 mt-1">
              Total transactions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Quantity Sold</CardTitle>
            <TrendingUp className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summaryStats.totalQuantity)}</div>
            <p className="text-xs opacity-90 mt-1">
              Items sold
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Avg Price</CardTitle>
            <DollarSign className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryStats.avgPrice)}</div>
            <p className="text-xs opacity-90 mt-1">
              Average product price
            </p>
          </CardContent>
        </Card>
      </div> */}

      {/* Revenue Data Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>
                Revenue by Product 
                {selectedCountry && selectedCountry !== 'all' && ` - ${selectedCountry}`}
              </CardTitle>
              <CardDescription>
                Showing {revenueData.length} of {formatNumber(pagination.total_count)} products
                {selectedCountry && selectedCountry !== 'all' ? ` in ${selectedCountry}` : ' across all countries'}
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
          {revenueLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 font-medium text-gray-600">Rank</th>
                      <th className="text-left py-3 font-medium text-gray-600">Country</th>
                      <th className="text-left py-3 font-medium text-gray-600">Product Name</th>
                      <th className="text-right py-3 font-medium text-gray-600">Total Revenue</th>
                      <th className="text-right py-3 font-medium text-gray-600">Transactions</th>
                      <th className="text-right py-3 font-medium text-gray-600">Quantity</th>
                      <th className="text-right py-3 font-medium text-gray-600">Avg Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.map((item, index) => (
                      <tr key={`${item.country}-${item.product_name}-${index}`} className="border-b hover:bg-gray-50">
                        <td className="py-3">
                          <span className="inline-flex items-center justify-center w-8 h-6 text-xs font-medium text-white bg-blue-500 rounded">
                            {item.revenue_rank}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="inline-flex px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            {item.country}
                          </span>
                        </td>
                        <td className="py-3 font-medium max-w-xs truncate" title={item.product_name}>
                          {item.product_name}
                        </td>
                        <td className="py-3 text-right font-semibold text-green-600">
                          {formatCurrency(item.total_revenue)}
                        </td>
                        <td className="py-3 text-right">
                          {formatNumber(item.transaction_count)}
                        </td>
                        <td className="py-3 text-right">
                          {formatNumber(item.total_quantity)}
                        </td>
                        <td className="py-3 text-right font-medium">
                          {formatCurrency(item.avg_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="text-sm text-gray-600">
                  Showing page {pagination.page} of {Math.ceil(pagination.total_count / pagination.limit)}
                  {' '}({formatNumber(pagination.total_count)} total products)
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1 || revenueLoading}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>
                  
                  <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md">
                    Page {pagination.page}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.has_more || revenueLoading}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <strong>Total Countries:</strong> {countries.length}
            </div>
            <div>
              <strong>Current Filter:</strong> {selectedCountry === 'all' ? 'All Countries' : selectedCountry}
            </div>
            <div>
              <strong>Records Per Page:</strong> {pagination.limit}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}