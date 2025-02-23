import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title } from "chart.js";

// Register necessary chart.js components for Bar chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title);

type Props = {};

type Statistics = {
  totalProducts: number;
  totalOrders: number;
  deliveredOrders: number;
  canceledOrders: number;
};

const AdminDashboard = (props: Props) => {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get<Statistics>("http://localhost:28017/api/admin/stats");
        setStats(response.data);
      } catch (err) {
        console.error("Error fetching statistics:", err);
        setError("Failed to fetch statistics. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  // Data for the Bar chart
  const chartData = {
    labels: ["Tổng sản phẩm", "Tổng đơn hàng", "Đơn hàng đã giao", "Đơn hàng bị hủy"], // Labels for the bars
    datasets: [
      {
        label: "", 
        data: [
          stats ? stats.totalProducts : 0,
          stats ? stats.totalOrders : 0,
          stats ? stats.deliveredOrders : 0,
          stats ? stats.canceledOrders : 0
        ],
        backgroundColor: [
          "rgba(59, 130, 246, 0.7)",  
          "rgba(234, 179, 8, 0.7)",   
          "rgba(34, 197, 94, 0.7)",   
          "rgba(248, 113, 113, 0.7)"  
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(234, 179, 8, 1)",
          "rgba(34, 197, 94, 1)",
          "rgba(248, 113, 113, 1)"
        ],
        borderWidth: 1
      }
    ]
  };

  return (
    <div
      className="container mx-auto p-6 relative"
      style={{
        backgroundImage: "url('http://localhost:3000/static/media/orientale-bst-scaled.ac30195c711cbae4e35e.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="bg-blue-500 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold">Tổng sản phẩm</h2>
            <p className="text-3xl font-bold mt-2">{stats ? stats.totalProducts : "--"}</p>
          </div>
          <div className="bg-yellow-500 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold">Tổng đơn hàng</h2>
            <p className="text-3xl font-bold mt-2">{stats ? stats.totalOrders : "--"}</p>
          </div>
          <div className="bg-green-500 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold">Đơn hàng đã giao</h2>
            <p className="text-3xl font-bold mt-2">{stats ? stats.deliveredOrders : "--"}</p>
          </div>
          <div className="bg-red-500 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold">Đơn hàng bị hủy</h2>
            <p className="text-3xl font-bold mt-2">{stats ? stats.canceledOrders : "--"}</p>
          </div>
        </div>

        <div className="text-center mt-6">
          {isLoading && <p className="text-lg text-white">Loading statistics...</p>}
          {error && <p className="text-red-500">{error}</p>}
        </div>

          <div
          className="mt-6"
          style={{
            width: "75%", 
            margin: "0 auto",
            padding: "10px",
            backgroundColor: "rgba(0, 0, 0, 0.6)", 
            borderRadius: "10px"
          }}
        >
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: "",
                  color: "white",
                  font: { size: 14 }, 
                },
                tooltip: {
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  titleColor: "white",
                  bodyColor: "white",
                }
              },
              scales: {
                x: {
                  beginAtZero: true,  
                  ticks: {
                    color: "white", 
                  },
                },
                y: {
                  beginAtZero: true,  
                  ticks: {
                    color: "white", 
                  },
                }
              }
            }}
            height={150} 
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
