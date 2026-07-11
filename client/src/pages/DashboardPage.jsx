import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/useAuth";

function DashboardPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [profileStatus, setProfileStatus] = useState("loading");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const response = await axiosClient.get("/users/me");

        if (!isMounted) {
          return;
        }

        setProfile(response.data);
        setProfileStatus("success");
      } catch {
        if (!isMounted) {
          return;
        }

        setProfileStatus("error");
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <main className="dashboard-shell">
      <section className="dashboard-card">
        <div className="dashboard-header">
          <div>
            <p className="eyebrow">Applauz Dashboard</p>
            <h1>Welcome, {user.name}</h1>
            <p className="description">
              This is a placeholder protected route proving the React login
              flow, bearer token attachment, and logout path are wired up.
            </p>
          </div>

          <button className="secondary-button" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className={`profile-panel profile-panel--${profileStatus}`}>
          <span className="status-label">Protected API check</span>
          {profileStatus === "loading" ? (
            <p>Loading your profile from the backend...</p>
          ) : null}
          {profileStatus === "success" ? (
            <div className="profile-grid">
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Role:</strong> {profile.roleName}</p>
              <p><strong>Department:</strong> {profile.departmentName || "None"}</p>
              <p><strong>Points:</strong> {profile.pointsBalance}</p>
            </div>
          ) : null}
          {profileStatus === "error" ? (
            <p>Authenticated route failed to load. Please try logging in again.</p>
          ) : null}
        </div>
      </section>
    </main>
  );
}

export default DashboardPage;
