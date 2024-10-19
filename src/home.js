// src/pages/Home.js
import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase"; // Ensure the correct path to firebase.js
import { addDoc, collection } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

function Home() {
  const [result, setResult] = useState(""); // Store the prediction result
  const [image, setImage] = useState(null); // Store the uploaded image
  const [loading, setLoading] = useState(false); // Track loading state
  const [user, setUser] = useState(null); // Store the current user
  const [dropdownOpen, setDropdownOpen] = useState(false); // Track dropdown visibility
  const [imagePreview, setImagePreview] = useState(null); // Store the preview URL
  const navigate = useNavigate(); // For navigation

  // Fetch the current user from Firebase auth
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
    } else {
      navigate("/login"); // Redirect to login if not authenticated
    }
  }, [navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file); // Store the uploaded image file

      // Generate an image preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImage(null);
      setImagePreview(null); // Clear preview if no file is selected
    }
  };

  const handlePrediction = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Please upload an image first.");
      return;
    }

    setLoading(true); // Set loading state to true while waiting for prediction

    try {
      const formData = new FormData();
      formData.append("file", image);

      const response = await fetch(
        "https://8c01-34-19-26-198.ngrok-free.app/predict",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json(); // Parse the JSON response
      const prediction = data.predicted_nitrogen_level; // Extract prediction

      setResult(prediction); // Set the result in state

      // Store the result in Firestore
      await addDoc(collection(db, "history"), {
        userId: auth.currentUser.uid,
        result: prediction,
        date: new Date(),
      });
    } catch (error) {
      console.error("Error during prediction:", error);
      alert("There was an error with the prediction. Please try again.");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

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
          <Link to="/history" className="text-gray-300 hover:text-white">
            History
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
        <h2 className="text-2xl font-semibold mb-4">Upload and Predict</h2>

        <form onSubmit={handlePrediction} className="w-full max-w-lg space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full border border-gray-600 rounded-lg px-3 py-2 bg-[#2E3C44] text-white"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Image Preview"
              className="w-full h-64 object-cover rounded-lg mt-4"
            />
          )}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#5CA5A5] hover:bg-[#487B77] text-white py-2 px-4 rounded-lg transition duration-300 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Predicting..." : "Predict"}
          </button>
        </form>

        {loading && (
          <div className="flex justify-center items-center mt-4">
            <div className="w-10 h-10 border-4 border-t-transparent border-[#5CA5A5] rounded-full animate-spin"></div>
          </div>
        )}

        {/* Display the prediction result */}
        {result && (
          <h3 className="mt-6 text-lg font-semibold">
            Predicted Nitrogen Level: {result}
          </h3>
        )}
      </div>
    </div>
  );
}

export default Home;
