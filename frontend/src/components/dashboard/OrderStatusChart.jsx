import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

const OrderStatusChart = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderStatusData = async () => {
            try {
                const response = await fetch('/api/admin/order-status-chart', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    setData(result.data);
                } else {
                    setError('Failed to load order status data');
                }
            } catch (err) {
                setError('Error fetching order status data');
                console.error('Order status chart fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderStatusData();
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
        <div className="w-full h-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: isDark ? '#1f2937' : '#ffffff',
                            borderColor: isDark ? '#374151' : '#e5e7eb',
                            color: isDark ? '#ffffff' : '#000000'
                        }}
                    />
                    <Legend wrapperStyle={{ color: isDark ? '#9ca3af' : '#6b7280' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default OrderStatusChart;
