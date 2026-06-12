import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

const UserGrowthChart = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserGrowthData = async () => {
            try {
                const response = await fetch('/api/admin/user-growth-chart', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    setData(result.data);
                } else {
                    setError('Failed to load user growth data');
                }
            } catch (err) {
                setError('Error fetching user growth data');
                console.error('User growth chart fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserGrowthData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center w-full h-full min-h-[250px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-slate-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center w-full h-full min-h-[250px]">
                <p className="text-red-500 font-bold text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
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
                        cursor={{ fill: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                    />
                    <Legend wrapperStyle={{ color: isDark ? '#9ca3af' : '#6b7280' }} />
                    <Bar dataKey="customers" stackId="a" fill="#3b82f6" />
                    <Bar dataKey="vendors" stackId="a" fill="#10b981" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default UserGrowthChart;
