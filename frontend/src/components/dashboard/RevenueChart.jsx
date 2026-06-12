import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

const RevenueChart = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRevenueData = async () => {
            try {
                const response = await fetch('/api/admin/revenue-chart', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    setData(result.data);
                } else {
                    setError('Failed to load revenue data');
                }
            } catch (err) {
                setError('Error fetching revenue data');
                console.error('Revenue chart fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRevenueData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center w-full h-full min-h-[300px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-slate-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center w-full h-full min-h-[300px]">
                <p className="text-red-500 font-bold text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} />
                    <XAxis
                        dataKey="name"
                        stroke={isDark ? "#9ca3af" : "#6b7280"}
                        tick={{ fill: isDark ? "#9ca3af" : "#6b7280" }}
                    />
                    <YAxis
                        stroke={isDark ? "#9ca3af" : "#6b7280"}
                        tick={{ fill: isDark ? "#9ca3af" : "#6b7280" }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: isDark ? '#1f2937' : '#ffffff',
                            borderColor: isDark ? '#374151' : '#e5e7eb',
                            color: isDark ? '#ffffff' : '#000000'
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#8884d8"
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RevenueChart;
