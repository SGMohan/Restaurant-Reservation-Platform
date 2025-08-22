import { useEffect, useState } from "react";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import { FiClock as FiPending } from "react-icons/fi"; // Pending icon
import { FaCalendarAlt, FaUsers } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import { useApp } from "../../Context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";

// Helper function to get status icon based on reservation status
const getStatusIcon = (status) => {
  switch (status) {
    case "Confirmed":
      return <FiCheckCircle className="text-green-500 mr-1" size={16} />;
    case "Pending":
      return <FiPending className="text-yellow-500 mr-1" size={16} />;
    case "Cancelled":
      return <FiXCircle className="text-red-500 mr-1" size={16} />;
    default:
      return null;
  }
};

/**
 * Dashboard Component - Displays restaurant owner dashboard with stats and recent reservations
 */
const Dashboard = () => {
  // Context and state initialization
  const { CURRENCY, isOwner, token, loadingUser, BACKEND_URL } = useApp();
  const [dashboardData, setDashboardData] = useState({
    reservations: [],
    totalReservations: 0,
    totalRevenue: 0,
    cancellationRate: 0,
    averageGuests: 0,
  });

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/reservation/restaurant-bookings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setDashboardData(response.data.dashboardData);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch dashboard data"
      );
    }
  };

  // Fetch data when component mounts and dependencies change
  useEffect(() => {
    if (loadingUser) return;

    if (isOwner && token) {
      fetchDashboardData();
    }
  }, [isOwner, token, loadingUser]);

  // Clear dashboard data if token is removed
  useEffect(() => {
    if (!token) {
      setDashboardData([]);
    }
  }, [token]);

  return (
    <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600 text-xs sm:text-sm max-w-3xl">
          Monitor dining listings, track bookings and analyze revenue—all in one
          place. Stay updated with real-time insights to ensure smooth
          operations.
        </p>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 mb-6">
        {/* Total Reservations Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-md mr-3">
              <FaCalendarAlt className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Total Reservations
              </p>
              <p className="text-xl font-semibold text-gray-900">
                {dashboardData.totalReservations}
              </p>
            </div>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-md mr-3">
              <FaIndianRupeeSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
              <p className="text-xl font-semibold text-gray-900 flex items-center">
                {dashboardData.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Cancellation Rate Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="bg-red-100 p-2 rounded-md mr-3">
              <MdOutlineCancel className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Cancellation Rate
              </p>
              <p className="text-xl font-semibold text-gray-900 flex items-center">
                {dashboardData.cancellationRate}%
              </p>
            </div>
          </div>
        </div>

        {/* Average Guests Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-md mr-3">
              <FaUsers className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Average Guests
              </p>
              <p className="text-xl font-semibold text-gray-900 flex items-center">
                {dashboardData.averageGuests}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reservations Table */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3 border-b border-gray-200 pb-2">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">
            Recent Reservations
          </h2>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm my-6">
          <div className="overflow-x-auto">
            <div className="max-h-[60vh] overflow-y-auto">
              <table className="w-full hover:cursor-pointer">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs sm:text-sm font-semibold uppercase text-gray-500">
                      User Name
                    </th>
                    <th className="py-3 px-4 text-left text-xs sm:text-sm font-semibold uppercase text-gray-500 ">
                      Dining Area
                    </th>
                    <th className="py-3 px-4 text-left text-xs sm:text-sm font-semibold uppercase text-gray-500">
                      Amount
                    </th>
                    <th className="py-3 px-4 text-left text-xs sm:text-sm font-semibold uppercase text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dashboardData.reservations.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="py-3 px-4">
                        <div className="my-6">
                          <div className="text-sm font-medium text-gray-900">
                            {item.user?.name || "N/A"}
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">
                              {item.user?.email || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500 ">
                        <div className="my-6">
                          <div className="text-sm font-medium text-gray-900">
                            {item.restaurant?.name || "N/A"}
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">
                              {item.restaurant?.address || "N/A"}
                              {", "}
                              {item.restaurant?.city || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        <div className="flex items-center my-6">
                          {CURRENCY} {item.totalPrice || 0}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-900">
                          {getStatusIcon(item.status)}
                          {item.status || "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
