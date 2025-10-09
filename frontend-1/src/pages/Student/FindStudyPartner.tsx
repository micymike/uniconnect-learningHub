import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "https://uniconnect-learninghub-backend-yspz.onrender.com/api";

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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Fetch users with pagination
  const fetchUsers = async (pageNum = 1, append = false) => {
    if (loading || isFetchingMore) return;
    if (!hasMore && append) return;
    if (append) setIsFetchingMore(true);
    else setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${API_URL}/users?page=${pageNum}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      const newUsers = data.users || [];
      if (append) {
        setUsers((prev) => [...prev, ...newUsers]);
      } else {
        setUsers(newUsers);
      }
      setHasMore(newUsers.length === 20);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      if (append) setIsFetchingMore(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, false);
    setPage(1);
    setHasMore(true);
  }, []);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
        !loading &&
        !isFetchingMore &&
        hasMore
      ) {
        const nextPage = page + 1;
        fetchUsers(nextPage, true);
        setPage(nextPage);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, loading, isFetchingMore, hasMore]);

  const handleAddPartner = async (partnerId: string) => {
    setAdding(partnerId);
    setSuccess(null);
    setError("");
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${API_URL}/users/request-partner`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientId: partnerId }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (
          data.message &&
          (data.message.toLowerCase().includes("pending request already exists") ||
           data.message.toLowerCase().includes("already your study partner") ||
           data.message.toLowerCase().includes("already exists"))
        ) {
          setError("A request is already pending or this user is already your study partner.");
          setSuccess(null);
        } else {
          setError(data.message || "Failed to send request");
          setSuccess(null);
        }
      } else {
        const user = users.find(u => u.id === partnerId);
        const userName = user?.full_name || user?.email || 'User';
        setSuccess(`Request sent to ${userName}. They will need to accept before you become study partners.`);
        setError("");
        // Do not remove user from list; wait for acceptance
      }
    } catch (err: any) {
      setError(err.message || "Failed to send request");
      setSuccess(null);
    } finally {
      setAdding(null);
    }
  };

  // Get current user id from localStorage
  const currentUserId = (() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user.id;
    } catch {
      return null;
    }
  })();

  const filteredUsers = users.filter(
    (u) =>
      u.id !== currentUserId &&
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
                    {adding === user.id ? "Sending..." : "Send Study Partner Request"}
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
