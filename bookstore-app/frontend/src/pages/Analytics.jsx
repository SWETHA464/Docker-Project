import { useEffect, useState } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { api } from "../api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

const BURGUNDY = "#D64526";
const FOREST = "#5B8C5A";
const GOLD = "#E3A857";
const LEATHER = "#2B1B14";

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [popular, setPopular] = useState([]);
  const [trend, setTrend] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.getSummary(),
      api.getPopularItems(),
      api.getRevenueTrend(),
      api.getOrderStatusBreakdown(),
    ])
      .then(([s, p, t, st]) => {
        setSummary(s);
        setPopular(p);
        setTrend(t);
        setStatusBreakdown(st);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p style={{ color: "var(--burgundy)" }}>{error}</p>;
  if (!summary) return <p>Loading analytics...</p>;

  const trendData = {
    labels: trend.map((r) => new Date(r.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })),
    datasets: [
      {
        label: "Revenue (₹)",
        data: trend.map((r) => r.revenue),
        borderColor: BURGUNDY,
        backgroundColor: "rgba(214,69,38,0.12)",
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const popularData = {
    labels: popular.map((p) => p.name),
    datasets: [
      {
        label: "Units sold",
        data: popular.map((p) => p.total_sold),
        backgroundColor: GOLD,
        borderRadius: 6,
      },
    ],
  };

  const statusData = {
    labels: statusBreakdown.map((s) => s.status),
    datasets: [
      {
        data: statusBreakdown.map((s) => s.count),
        backgroundColor: [GOLD, BURGUNDY, FOREST, LEATHER, "#999"],
      },
    ],
  };

  return (
    <div>
      <h2>Analytics</h2>
      <p style={{ opacity: 0.6, marginBottom: 20 }}>Revenue, order volume and top-selling books.</p>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total Revenue</div>
          <div className="kpi-value">₹{Number(summary.total_revenue).toFixed(0)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Orders</div>
          <div className="kpi-value">{summary.total_orders}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Avg Order Value</div>
          <div className="kpi-value">₹{Number(summary.avg_order_value).toFixed(0)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Today's Revenue</div>
          <div className="kpi-value">₹{Number(summary.today_revenue).toFixed(0)}</div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="card">
          <h3 style={{ fontSize: "1rem" }}>Revenue trend (last 14 days)</h3>
          {trend.length === 0 ? <p style={{ opacity: 0.6 }}>Not enough data yet.</p> : <Line data={trendData} />}
        </div>
        <div className="card">
          <h3 style={{ fontSize: "1rem" }}>Orders by status</h3>
          {statusBreakdown.length === 0 ? <p style={{ opacity: 0.6 }}>Not enough data yet.</p> : <Doughnut data={statusData} />}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: "1rem" }}>Top-selling books</h3>
        {popular.length === 0 ? <p style={{ opacity: 0.6 }}>Not enough data yet.</p> : <Bar data={popularData} />}
      </div>
    </div>
  );
}
