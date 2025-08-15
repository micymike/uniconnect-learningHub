import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const API_URL = process.env.REACT_APP_API_URL;

type Summary = {
  totalUsers: number;
  totalStudents: number;
  totalAdmins: number;
  totalCourses: number;
};

const COLORS = ["#ff6600", "#007bff", "#00c49f", "#ffbb28"];

export default function AnalyticsDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoading(true);
    setError("");
    fetch(`${API_URL}/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).message || "Error");
        return res.json();
      })
      .then((data) => setSummary(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const pieData =
    summary && summary.totalUsers
      ? [
          { name: "Students", value: summary.totalStudents },
          { name: "Admins", value: summary.totalAdmins },
        ]
      : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex flex-col">
      <header className="bg-white shadow flex items-center px-8 py-4">
        <h1 className="text-2xl font-bold text-black">Analytics Dashboard</h1>
      </header>
      <main className="flex-1 px-8 py-8">
        {loading ? (
          <div className="text-white text-lg">Loading...</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : !summary ? (
          <div className="text-gray-300">No analytics data available.</div>
        ) : (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
                <div className="text-3xl font-bold text-orange-500">{summary.totalUsers}</div>
                <div className="text-gray-700 mt-2">Total Users</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
                <div className="text-3xl font-bold text-blue-500">{summary.totalStudents}</div>
                <div className="text-gray-700 mt-2">Students</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
                <div className="text-3xl font-bold text-green-500">{summary.totalAdmins}</div>
                <div className="text-gray-700 mt-2">Admins</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
                <div className="text-3xl font-bold text-yellow-500">{summary.totalCourses}</div>
                <div className="text-gray-700 mt-2">Courses</div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-xl mx-auto">
              <h2 className="text-xl font-bold mb-4 text-black">User Distribution</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
