// src/pages/History.js
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "./firebase"; // Ensure the correct import path
import { useNavigate, Link } from "react-router-dom";

function History() {
  const [history, setHistory] = useState([]); // Store prediction history
  const [loading, setLoading] = useState(true); // Track loading state
  const [user, setUser] = useState(null); // Store the current user
  const [dropdownOpen, setDropdownOpen] = useState(false); // Track dropdown visibility
  const navigate = useNavigate(); // Navigation function

  // Check if user is logged in and set user state
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
    } else {
      navigate("/login"); // Redirect to login if not authenticated
    }
  }, [navigate]);

  // Fetch prediction history from Firestore
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const q = query(
          collection(db, "history"),
          where("userId", "==", auth.currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const historyData = querySnapshot.docs.map((doc) => doc.data());
        setHistory(historyData);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false); // Stop loading when data is fetched
      }
    };

    fetchHistory();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login"); // Redirect to login on logout
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#2E3C44] text-[#E2F1E7]">
      {/* Navbar */}
      <nav className="bg-[#366D73] p-4 flex justify-between items-center">
        <Link to="/home" className="text-white text-xl font-semibold">
          Nitrogen Level Predictor
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/home" className="text-gray-300 hover:text-white">
            Home
          </Link>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="text-white font-semibold"
            >
              {user ? user.email : "User"} ▼
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg">
                <button
                  onClick={handleLogout}
                  className="block px-4 py-2 w-full text-left hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-8 flex flex-col items-center">
        <div className="bg-[#2E3C44] w-full max-w-2xl p-8 rounded-lg shadow-lg border border-[#487B77]">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Prediction History
          </h2>

          {loading ? (
            // Loading Spinner
            <div className="flex justify-center items-center">
              <div className="w-10 h-10 border-4 border-t-transparent border-[#5CA5A5] rounded-full animate-spin"></div>
            </div>
          ) : history.length === 0 ? (
            <p className="text-center text-gray-400">Your history is empty.</p>
          ) : (
            <ul className="space-y-4">
              {history.map((item, index) => (
                <li
                  key={index}
                  className="bg-[#366D73] text-white p-4 rounded-lg flex justify-between"
                >
                  <span>{new Date(item.date.toDate()).toLocaleString()}</span>
                  <span>{item.result}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default History;
