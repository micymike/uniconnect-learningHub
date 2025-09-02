import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "https://uniconnect-learninghub-backend.onrender.com/api";

type User = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
};

export default function FindStudyPartner() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token") || "";
        const res = await fetch(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data.users || []);
      } catch (err: any) {
        setError(err.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleAddPartner = async (partnerId: string) => {
    setAdding(partnerId);
    setSuccess(null);
    setError("");
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${API_URL}/users/add-partner`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ partnerId }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (
          data.message &&
          (data.message.toLowerCase().includes("already your study partner") ||
           data.message.toLowerCase().includes("already exists"))
        ) {
          setError("This user is already your study partner.");
          setSuccess(null);
          // Remove the user from the list if already a partner
          setUsers((prev) => prev.filter((u) => u.id !== partnerId));
        } else {
          setError(data.message || "Failed to add study partner");
          setSuccess(null);
        }
      } else {
        const user = users.find(u => u.id === partnerId);
        const userName = user?.full_name || user?.email || 'New partner';
        const funMessages = [
          `🎉 Awesome! ${userName} is now your study buddy!`,
          `🚀 Great choice! ${userName} joined your study squad!`,
          `📚 Perfect match! ${userName} is ready to study with you!`,
          `✨ Study partnership activated with ${userName}!`,
          `🎯 Success! ${userName} is now part of your learning journey!`,
          `🌟 Fantastic! ${userName} is your new study companion!`
        ];
        const randomMessage = funMessages[Math.floor(Math.random() * funMessages.length)];
        setSuccess(randomMessage);
        setError("");
        // Remove the user from the list after successful addition
        setUsers((prev) => prev.filter((u) => u.id !== partnerId));
      }
    } catch (err: any) {
      if (
        err.message &&
        (err.message.toLowerCase().includes("already your study partner") ||
         err.message.toLowerCase().includes("already exists"))
      ) {
        setError("This user is already your study partner.");
        setSuccess(null);
        setUsers((prev) => prev.filter((u) => u.id !== partnerId));
      } else {
        setError(err.message || "Failed to add study partner");
        setSuccess(null);
      }
    } finally {
      setAdding(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      (u.full_name || u.email || "")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center px-2 sm:px-4 py-4 sm:py-8">
      {/* Success Popup */}
      {success && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
          <div className="flex items-center space-x-2">
            <span>{success}</span>
            <button
              onClick={() => setSuccess(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <h1 className="text-2xl sm:text-3xl font-bold text-orange-400 mb-6 sm:mb-8 text-center">
        Find a Study Partner
      </h1>
      <div className="bg-gray-900 rounded-xl shadow-lg p-4 sm:p-6 w-full max-w-2xl mb-8">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 mb-4"
        />
        {loading ? (
          <div className="text-gray-400 text-center">Loading users...</div>
        ) : error ? (
          <div className="bg-red-900 text-red-300 p-2 rounded text-center">{error}</div>
        ) : (
          <ul className="divide-y divide-gray-800">
            {filteredUsers.length === 0 ? (
              <li className="text-gray-400 text-center py-4">No users found.</li>
            ) : (
              filteredUsers.map((user) => (
                <li key={user.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 gap-2">
                  <div className="flex items-center gap-3">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name || user.email}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                        {(user.full_name || user.email || "?")[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-white">{user.full_name || user.email}</div>
                      <div className="text-gray-400 text-xs">{user.email}</div>
                    </div>
                  </div>
                  <button
                    className={`
                      w-full sm:w-auto
                      px-4 py-2 rounded font-semibold text-sm transition
                      ${adding === user.id
                        ? "bg-gray-600 text-gray-300 cursor-wait"
                        : "bg-orange-500 hover:bg-orange-600 text-white"
                      }
                    `}
                    style={{
                      minWidth: "160px",
                      marginLeft: "0",
                      marginTop: "0.5rem",
                      marginBottom: "0.5rem"
                    }}
                    disabled={adding === user.id}
                    onClick={() => handleAddPartner(user.id)}
                  >
                    {adding === user.id ? "Adding..." : "Add as Study Partner"}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}

      </div>
    </div>
  );
}
