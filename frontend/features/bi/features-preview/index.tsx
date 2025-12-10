import React, { useState, useEffect } from 'react';
import { BiDashboard } from '../components/BiDashboard';
import { BiData } from '../types';

export const BiPreview = () => {
    // Mock Data
    const [data, setData] = useState<BiData>({
        isLoading: false,
        metrics: {
            revenue: { label: "Revenue", value: "$45,231.89", change: 20.1, trend: 'up', period: 'month' },
            activeUsers: { label: "Active Users", value: "+2350", change: 180.1, trend: 'up', period: 'month' },
            conversionRate: { label: "Conversion Rate", value: "3.2%", change: 19, trend: 'up', period: 'month' },
            churnRate: { label: "Churn Rate", value: "1.1%", change: -5, trend: 'down', period: 'month' }
        },
        revenueHistory: [
            { name: "Jan", value: 4000, secondaryValue: 2400 },
            { name: "Feb", value: 3000, secondaryValue: 1398 },
            { name: "Mar", value: 2000, secondaryValue: 9800 },
            { name: "Apr", value: 2780, secondaryValue: 3908 },
            { name: "May", value: 1890, secondaryValue: 4800 },
            { name: "Jun", value: 2390, secondaryValue: 3800 },
            { name: "Jul", value: 3490, secondaryValue: 4300 }
        ],
        userGrowth: [
            { name: "Mon", value: 2400, secondaryValue: 1200 },
            { name: "Tue", value: 1398, secondaryValue: 1400 },
            { name: "Wed", value: 9800, secondaryValue: 4000 },
            { name: "Thu", value: 3908, secondaryValue: 2000 },
            { name: "Fri", value: 4800, secondaryValue: 3400 },
            { name: "Sat", value: 3800, secondaryValue: 2800 },
            { name: "Sun", value: 4300, secondaryValue: 3000 }
        ],
        deviceUsage: [
            { name: "Desktop", value: 400 },
            { name: "Mobile", value: 300 },
            { name: "Tablet", value: 300 }
        ]
    });

    return (
        <div className="p-6">
            <BiDashboard data={data} />
        </div>
    );
};

export default BiPreview;
