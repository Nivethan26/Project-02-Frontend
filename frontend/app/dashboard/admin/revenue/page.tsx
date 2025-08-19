"use client"

import { useState } from "react"
import { CalendarDays, DollarSign, TrendingUp, TrendingDown, BarChart3, PieChart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectItem } from "@/components/ui/select"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Pie,
  PieChart as RechartsPieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

// Sample data
const monthlyData = [
  { month: "Jan", revenue: 45000, expenses: 32000, profit: 13000 },
  { month: "Feb", revenue: 52000, expenses: 35000, profit: 17000 },
  { month: "Mar", revenue: 48000, expenses: 33000, profit: 15000 },
  { month: "Apr", revenue: 61000, expenses: 38000, profit: 23000 },
  { month: "May", revenue: 55000, expenses: 36000, profit: 19000 },
  { month: "Jun", revenue: 67000, expenses: 41000, profit: 26000 },
  { month: "Jul", revenue: 72000, expenses: 43000, profit: 29000 },
  { month: "Aug", revenue: 69000, expenses: 42000, profit: 27000 },
  { month: "Sep", revenue: 78000, expenses: 46000, profit: 32000 },
  { month: "Oct", revenue: 84000, expenses: 49000, profit: 35000 },
  { month: "Nov", revenue: 91000, expenses: 52000, profit: 39000 },
  { month: "Dec", revenue: 96000, expenses: 54000, profit: 42000 },
]

const revenueSourceData = [
  { name: "Product Sales", value: 450000, color: "#8b5cf6" },
  { name: "Subscriptions", value: 280000, color: "#06b6d4" },
  { name: "Services", value: 180000, color: "#10b981" },
  { name: "Partnerships", value: 90000, color: "#f59e0b" },
]

export default function RevenuePage() {
  const [timeRange, setTimeRange] = useState("12m")

  const currentMonthRevenue = monthlyData[monthlyData.length - 1].revenue
  const previousMonthRevenue = monthlyData[monthlyData.length - 2].revenue
  const monthlyGrowth = (((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100).toFixed(1)

  const totalRevenue = monthlyData.reduce((sum, month) => sum + month.revenue, 0)
  const totalProfit = monthlyData.reduce((sum, month) => sum + month.profit, 0)
  const profitMargin = ((totalProfit / totalRevenue) * 100).toFixed(1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Revenue Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Track your business performance and growth metrics
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={timeRange} onChange={e => setTimeRange(e.target.value)} className="w-[180px] px-3 py-2 rounded border">
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </Select>
            <Button variant="outline" size="sm">
              <CalendarDays className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
            <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
              <h2 className="text-sm font-medium opacity-90">Monthly Revenue</h2>
              <DollarSign className="h-4 w-4 opacity-90" />
            </div>
            <CardContent>
              <div className="text-2xl font-bold">${currentMonthRevenue.toLocaleString()}</div>
              <div className="flex items-center space-x-2 mt-2">
                {Number.parseFloat(monthlyGrowth) > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-200" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-200" />
                )}
                <span className="text-sm opacity-90">{monthlyGrowth}% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
            <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
              <h2 className="text-sm font-medium opacity-90">Total Revenue</h2>
              <BarChart3 className="h-4 w-4 opacity-90" />
            </div>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <p className="text-sm opacity-90 mt-2">Year to date performance</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-green-600 text-white">
            <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
              <h2 className="text-sm font-medium opacity-90">Total Profit</h2>
              <TrendingUp className="h-4 w-4 opacity-90" />
            </div>
            <CardContent>
              <div className="text-2xl font-bold">${totalProfit.toLocaleString()}</div>
              <p className="text-sm opacity-90 mt-2">{profitMargin}% profit margin</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
              <h2 className="text-sm font-medium opacity-90">Avg. Monthly Growth</h2>
              <PieChart className="h-4 w-4 opacity-90" />
            </div>
            <CardContent>
              <div className="text-2xl font-bold">+12.4%</div>
              <p className="text-sm opacity-90 mt-2">Consistent upward trend</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue Trend Chart */}
          <Card className="border-0 shadow-lg">
            <div className="p-6 pb-2">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-violet-600" />
                <span className="font-semibold">Revenue Trend</span>
              </div>
              <p className="text-gray-500 text-sm">Monthly revenue, expenses, and profit over time</p>
            </div>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="fillProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fillOpacity={1} fill="url(#fillRevenue)" />
                  <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#fillProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Sources */}
          <Card className="border-0 shadow-lg">
            <div className="p-6 pb-2">
              <div className="flex items-center space-x-2">
                <PieChart className="h-5 w-5 text-cyan-600" />
                <span className="font-semibold">Revenue Sources</span>
              </div>
              <p className="text-gray-500 text-sm">Breakdown of revenue by source</p>
            </div>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={revenueSourceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {revenueSourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-white p-3 border rounded-lg shadow-lg">
                              <p className="font-medium">{data.name}</p>
                              <p className="text-sm text-slate-600">${data.value.toLocaleString()}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {revenueSourceData.map((source, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{source.name}</p>
                      <p className="text-xs text-slate-600">${source.value.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Breakdown */}
        <Card className="border-0 shadow-lg">
          <div className="p-6 pb-2">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              <span className="font-semibold">Monthly Performance</span>
            </div>
            <p className="text-gray-500 text-sm">Detailed monthly revenue and profit analysis</p>
          </div>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Indicators */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-0 shadow-lg">
            <div className="p-6 pb-2">
              <h2 className="text-lg font-semibold">Growth Rate</h2>
            </div>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">+24.5%</p>
                  <p className="text-sm text-slate-600">Year over year</p>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  Excellent
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <div className="p-6 pb-2">
              <h2 className="text-lg font-semibold">Revenue Goal</h2>
            </div>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-600">87%</p>
                  <p className="text-sm text-slate-600">of annual target</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">
                  On Track
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <div className="p-6 pb-2">
              <h2 className="text-lg font-semibold">Best Month</h2>
            </div>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-purple-600">December</p>
                  <p className="text-sm text-slate-600">$96,000 revenue</p>
                </div>
                <Badge className="bg-purple-100 text-purple-800">
                  Peak
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 