"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { Bell, MapPin, Send, Plus, RefreshCw } from "lucide-react";

// Dynamic import for Map to avoid SSR
const Map = dynamic(() => import("../../components/Map"), { ssr: false });

export default function DashboardPage() {
  const [boreholes, setBoreholes] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [smsData, setSmsData] = useState({ to: "", message: "" });

  // New Borehole Form
  const [newBorehole, setNewBorehole] = useState({
    name: "",
    village_id: 1,
    status: "Working",
    water_level: 100.0,
  });

  const fetchData = async () => {
    try {
      const bhRes = await fetch("http://localhost:3001/api/boreholes");
      const bhData = await bhRes.json();
      setBoreholes(bhData);

      const alertsRes = await fetch("http://localhost:3001/api/alerts");
      const alertsData = await alertsRes.json();
      setAlerts(alertsData);

      const reportsRes = await fetch("http://localhost:3001/api/reports");
      const reportsData = await reportsRes.json();
      setReports(reportsData);

      setLoading(false);
    } catch (e) {
      console.error("Failed to fetch data", e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5s for demo
    return () => clearInterval(interval);
  }, []);

  const triggerAI = async () => {
    await fetch("http://localhost:3001/api/ai/update-risk", { method: "POST" });
    fetchData();
  };

  const sendSMS = async () => {
    if (!smsData.to || !smsData.message) return;
    await fetch("http://localhost:3001/api/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(smsData),
    });
    alert(`SMS sent to ${smsData.to}`);
    setSmsData({ to: "", message: "" });
  };

  const addBorehole = async () => {
    await fetch("http://localhost:3001/api/boreholes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBorehole),
    });
    setShowModal(false);
    fetchData();
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  const statusData = [
    {
      name: "Working",
      value: boreholes.filter((b) => b.status === "Working").length,
    },
    {
      name: "Broken",
      value: boreholes.filter((b) => b.status === "Broken").length,
    },
    {
      name: "Low Water",
      value: boreholes.filter((b) => b.status === "Low Water").length,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <header className="bg-bluenight text-white p-4 flex justify-between items-center shadow-lg bg-gray-900">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">💧</span>
          <h1 className="text-2xl font-bold tracking-wide">AquaGuard Admin</h1>
        </div>
        <div className="flex space-x-4 items-center">
          <button
            onClick={triggerAI}
            className="flex items-center space-x-1 bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-bold transition"
          >
            <RefreshCw size={18} /> <span>Simulate AI</span>
          </button>
          <Link
            href="/"
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            Home
          </Link>
        </div>
      </header>

      <main className="flex-grow p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Map & Analytics */}
        <div className="lg:col-span-3 flex flex-col space-y-6">
          {/* Map Section */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 h-[450px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <MapPin className="mr-2" size={20} /> Live Water Map
              </h2>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center"
              >
                <Plus size={16} className="mr-1" /> Add Borehole
              </button>
            </div>
            <div className="flex-grow rounded-lg overflow-hidden border border-gray-100 relative">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                  Loading Map...
                </div>
              ) : (
                <Map data={boreholes} />
              )}
            </div>
          </div>

          {/* Analytics Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-700 mb-4">Borehole Status</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-700 mb-4">Report Volume</h3>
              <div className="h-48 text-center flex items-center justify-center text-gray-400">
                <p>Live Chart Simulation Placeholder</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Alerts & Comms */}
        <div className="flex flex-col space-y-6">
          {/* Live Alerts Panel */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex-grow max-h-[500px] flex flex-col">
            <h2 className="text-lg font-bold mb-3 text-gray-800 flex items-center">
              <Bell className="mr-2 text-red-500" size={20} /> Live Alerts
            </h2>
            <div className="space-y-3 overflow-y-auto pr-2">
              {alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.severity === "Critical"
                      ? "bg-red-50 border-red-500"
                      : "bg-blue-50 border-blue-500"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span
                      className={`text-xs font-bold uppercase ${
                        alert.severity === "Critical"
                          ? "text-red-600"
                          : "text-blue-600"
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(alert.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mt-1">
                    {alert.message}
                  </p>
                </div>
              ))}
              {alerts.length === 0 && (
                <p className="text-gray-400 text-center text-sm">
                  No active alerts.
                </p>
              )}
            </div>
          </div>

          {/* SMS Manager */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-3 text-gray-800 flex items-center">
              <Send className="mr-2 text-green-600" size={20} /> SMS Broadcaster
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Phone Number"
                className="w-full p-2 border rounded bg-gray-50 text-sm"
                value={smsData.to}
                onChange={(e) => setSmsData({ ...smsData, to: e.target.value })}
              />
              <textarea
                placeholder="Message content..."
                className="w-full p-2 border rounded bg-gray-50 text-sm h-20"
                value={smsData.message}
                onChange={(e) =>
                  setSmsData({ ...smsData, message: e.target.value })
                }
              />
              <button
                onClick={sendSMS}
                className="w-full bg-green-600 text-white font-bold py-2 rounded text-sm hover:bg-green-700 transition"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Add Borehole Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-96">
            <h2 className="text-xl font-bold mb-4">Add New Borehole</h2>
            <div className="space-y-4">
              <input
                placeholder="Name (e.g., BH-005)"
                className="w-full p-2 border rounded"
                value={newBorehole.name}
                onChange={(e) =>
                  setNewBorehole({ ...newBorehole, name: e.target.value })
                }
              />
              <select
                className="w-full p-2 border rounded"
                value={newBorehole.status}
                onChange={(e) =>
                  setNewBorehole({ ...newBorehole, status: e.target.value })
                }
              >
                <option>Working</option>
                <option>Broken</option>
              </select>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={addBorehole}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
