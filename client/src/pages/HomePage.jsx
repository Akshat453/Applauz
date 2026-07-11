import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

function HomePage() {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await axiosClient.get("/health");
        setStatus("success");
        setMessage(response.data.status);
      } catch (error) {
        setStatus("error");
        setMessage(error.message || "Unable to reach the API.");
      }
    };

    fetchHealth();
  }, []);

  return (
    <main className="app-shell">
      <section className="status-card">
        <p className="eyebrow">Rewards & Recognition Platform</p>
        <h1>Scaffold is live</h1>
        <p className="description">
          The frontend is routed through Vite and ready to talk to the Express
          API through <code>/api</code>.
        </p>
        <div className={`status-panel status-panel--${status}`}>
          <span className="status-label">API health</span>
          {status === "loading" && <p>Checking backend connection...</p>}
          {status === "success" && <p>Connected successfully: {message}</p>}
          {status === "error" && <p>Connection failed: {message}</p>}
        </div>
      </section>
    </main>
  );
}

export default HomePage;
