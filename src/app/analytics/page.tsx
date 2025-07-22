'use client';

import { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  Share2,
  Calendar,
  Download,
  Filter
} from 'lucide-react';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - replace with real API calls
  const mockData = {
    overview: [
      { name: 'Views', value: 12543, change: '+15%', color: '#3B82F6' },
      { name: 'Unique Visitors', value: 8234, change: '+12%', color: '#10B981' },
      { name: 'Likes', value: 1456, change: '+8%', color: '#F59E0B' },
      { name: 'Shares', value: 234, change: '+25%', color: '#EF4444' }
    ],
    dailyViews: [
      { date: '2024-01-01', views: 120, visitors: 80 },
      { date: '2024-01-02', views: 150, visitors: 95 },
      { date: '2024-01-03', views: 180, visitors: 110 },
      { date: '2024-01-04', views: 220, visitors: 140 },
      { date: '2024-01-05', views: 190, visitors: 125 },
      { date: '2024-01-06', views: 250, visitors: 160 },
      { date: '2024-01-07', views: 280, visitors: 180 }
    ],
    topPosts: [
      { title: 'Getting Started with AI Content', views: 1234, likes: 89 },
      { title: '10 Tips for Better SEO', views: 987, likes: 67 },
      { title: 'Future of Content Marketing', views: 756, likes: 45 },
      { title: 'Collaboration in Remote Teams', views: 543, likes: 32 },
      { title: 'Building Better User Experiences', views: 432, likes: 28 }
    ],
    trafficSources: [
      { name: 'Direct', value: 35, color: '#3B82F6' },
      { name: 'Search', value: 28, color: '#10B981' },
      { name: 'Social', value: 20, color: '#F59E0B' },
      { name: 'Referral', value: 12, color: '#EF4444' },
      { name: 'Email', value: 5, color: '#8B5CF6' }
    ],
    deviceBreakdown: [
      { name: 'Desktop', value: 45 },
      { name: 'Mobile', value: 40 },
      { name: 'Tablet', value: 15 }
    ]
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAnalyticsData(mockData);
      setIsLoading(false);
    }, 1000);
  }, [timeRange]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-violet-50 dark:from-purple-100 dark:via-pink-100 dark:to-violet-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 border-b-2 border-purple-300 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 bg-white/20 border border-white/30 rounded text-white font-bold focus:outline-none focus:ring-2 focus:ring-white"
              >
                <option value="7d" className="text-purple-900">Last 7 days</option>
                <option value="30d" className="text-purple-900">Last 30 days</option>
                <option value="90d" className="text-purple-900">Last 90 days</option>
                <option value="1y" className="text-purple-900">Last year</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 font-bold"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 font-bold"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {analyticsData.overview.map((metric, index) => (
            <div key={index} className="bg-white dark:bg-purple-50 rounded-lg border-2 border-purple-300 dark:border-purple-400 shadow-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-purple-600 dark:text-purple-600">{metric.name}</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-900">{metric.value.toLocaleString()}</p>
                </div>
                <div className={`p-3 rounded-full`} style={{ backgroundColor: metric.color + '20' }}>
                  {index === 0 && <Eye className="h-6 w-6" style={{ color: metric.color }} />}
                  {index === 1 && <Users className="h-6 w-6" style={{ color: metric.color }} />}
                  {index === 2 && <Heart className="h-6 w-6" style={{ color: metric.color }} />}
                  {index === 3 && <Share2 className="h-6 w-6" style={{ color: metric.color }} />}
                </div>
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-bold">{metric.change}</span>
                <span className="text-sm text-purple-600 dark:text-purple-600 ml-1 font-semibold">vs last period</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Views Chart */}
          <div className="bg-white dark:bg-purple-50 rounded-lg border-2 border-purple-300 dark:border-purple-400 shadow-xl p-6">
            <h3 className="text-lg font-bold text-purple-900 dark:text-purple-900 mb-4">Daily Views & Visitors</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.dailyViews}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="views" 
                  stackId="1" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="visitors" 
                  stackId="2" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Traffic Sources */}
          <div className="bg-white dark:bg-purple-50 rounded-lg border-2 border-purple-300 dark:border-purple-400 shadow-xl p-6">
            <h3 className="text-lg font-bold text-purple-900 dark:text-purple-900 mb-4">Traffic Sources</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.trafficSources}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.trafficSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Posts */}
          <div className="lg:col-span-2 bg-white dark:bg-purple-50 rounded-lg border-2 border-purple-300 dark:border-purple-400 shadow-xl">
            <div className="p-6 border-b-2 border-purple-200 dark:border-purple-300 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-100 dark:to-pink-100">
              <h3 className="text-lg font-bold text-purple-900 dark:text-purple-900">Top Performing Posts</h3>
            </div>
            <div className="divide-y divide-purple-200 dark:divide-purple-300">
              {analyticsData?.topPosts.map((post, index) => (
                <div key={index} className="p-6 hover:bg-purple-100 dark:hover:bg-purple-200 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-purple-900 dark:text-purple-900 mb-1">
                        {post.title}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-purple-600 dark:text-purple-600 font-semibold">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{post.views.toLocaleString()} views</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span>{post.likes} likes</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-900 dark:text-purple-900">#{index + 1}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="bg-white dark:bg-purple-50 rounded-lg border-2 border-purple-300 dark:border-purple-400 shadow-xl p-6">
            <h3 className="text-lg font-bold text-purple-900 dark:text-purple-900 mb-4">Device Breakdown</h3>
            <div className="space-y-4">
              {analyticsData?.deviceBreakdown.map((device, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-bold text-purple-900 dark:text-purple-900">{device.name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-purple-200 dark:bg-purple-300 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                        style={{ width: `${device.value}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-purple-600 dark:text-purple-600 w-8 font-semibold">{device.value}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Real-time Stats */}
            <div className="mt-6 pt-6 border-t-2 border-purple-200 dark:border-purple-300">
              <h4 className="font-bold text-purple-900 dark:text-purple-900 mb-3">Real-time Activity</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-700 dark:text-purple-700 font-semibold">Active users</span>
                  <span className="font-bold text-purple-900 dark:text-purple-900">23</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-700 dark:text-purple-700 font-semibold">Page views (last hour)</span>
                  <span className="font-bold text-purple-900 dark:text-purple-900">156</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-700 dark:text-purple-700 font-semibold">New visitors today</span>
                  <span className="font-bold text-purple-900 dark:text-purple-900">89</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="mt-8 bg-white dark:bg-purple-50 rounded-lg border-2 border-purple-300 dark:border-purple-400 shadow-xl p-6">
          <h3 className="text-lg font-bold text-purple-900 dark:text-purple-900 mb-4">Engagement Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center bg-purple-100 dark:bg-purple-200 rounded-lg p-4 border border-purple-300 dark:border-purple-400">
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-900">2.5 min</div>
              <div className="text-sm text-purple-600 dark:text-purple-600 font-semibold">Avg. Time on Page</div>
            </div>
            <div className="text-center bg-purple-100 dark:bg-purple-200 rounded-lg p-4 border border-purple-300 dark:border-purple-400">
              <div className="text-2xl font-bold text-green-600">68%</div>
              <div className="text-sm text-purple-600 dark:text-purple-600 font-semibold">Bounce Rate</div>
            </div>
            <div className="text-center bg-purple-100 dark:bg-purple-200 rounded-lg p-4 border border-purple-300 dark:border-purple-400">
              <div className="text-2xl font-bold text-blue-600">3.2</div>
              <div className="text-sm text-purple-600 dark:text-purple-600 font-semibold">Pages per Session</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
