import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Replace with your actual API endpoint
const INVITE_ADMIN_API = "/api/admin/invite";

const InviteAdmin: React.FC<{ userRole?: string }> = ({ userRole }) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<null | string>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Only SUPAADMINs can access this page
    if (userRole !== "supaadmin") {
      navigate("/admin"); // Redirect to admin dashboard if not supaadmin
    }
  }, [userRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    try {
      const res = await fetch(INVITE_ADMIN_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("Admin invited/added successfully.");
        setEmail("");
      } else {
        const data = await res.json();
        setStatus(data.message || "Failed to invite admin.");
      }
    } catch (err) {
      setStatus("Error inviting admin.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", padding: "2rem", border: "1px solid #eee", borderRadius: 8 }}>
      <h2>Invite Admin</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Admin Email:
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: "100%", margin: "0.5rem 0", padding: "0.5rem" }}
          />
        </label>
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>Invite</button>
      </form>
      {status && <div style={{ marginTop: "1rem", color: status.includes("success") ? "green" : "red" }}>{status}</div>}
    </div>
  );
};

export default InviteAdmin;
