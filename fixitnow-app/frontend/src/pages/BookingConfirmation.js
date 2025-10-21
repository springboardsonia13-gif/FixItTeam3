import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiService from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBookingDetails = useCallback(async () => {
    try {
      const response = await apiService.getBookingById(bookingId);
      setBooking(response.data);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast.error('Failed to load booking details');
      navigate('/services');
    } finally {
      setLoading(false);
    }
  }, [bookingId, navigate]);

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      await apiService.updateBookingStatus(bookingId, newStatus);
      setBooking(prev => ({ ...prev, status: newStatus }));
      toast.success(`Booking ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  const startChat = async () => {
    try {
      if (!booking || !user) {
        toast.error('Unable to start chat - missing information');
        return;
      }

      // Determine customer and provider IDs
      const isProvider = user.role === 'PROVIDER';
      const customerId = isProvider ? booking.user?.id || booking.customerId : user.id;
      const providerId = isProvider ? user.id : booking.service?.provider?.id || booking.providerId;

      if (!customerId || !providerId) {
        toast.error('Unable to start chat - user information missing');
        return;
      }

      // Create or get existing chat room
      const chatData = {
        customerId: customerId,
        providerId: providerId,
        bookingId: booking.id
      };

      const response = await apiService.createChatRoom(chatData);
      const chatRoom = response.data;

      toast.success('Chat started successfully!');
      
      // Navigate to chat page with the room selected
      navigate('/chat', { 
        state: { 
          selectedRoom: chatRoom,
          fromBooking: true 
        } 
      });

    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat. Please try again.');
    }
  };

  useEffect(() => {
    fetchBookingDetails();
  }, [fetchBookingDetails]);

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderProviderActionItems = () => {
    const status = booking?.status;
    
    const steps = [
      {
        id: 1,
        title: "Booking Received",
        description: "Customer has submitted a booking request for your service",
        completed: true,
        current: false
      },
      {
        id: 2,
        title: "Review & Respond",
        description: "Accept or decline the booking request in your dashboard",
        completed: status === 'CONFIRMED' || status === 'IN_PROGRESS' || status === 'COMPLETED',
        current: status === 'PENDING'
      },
      {
        id: 3,
        title: "Provide Service",
        description: "Deliver quality service on the scheduled date and time",
        completed: status === 'COMPLETED',
        current: status === 'CONFIRMED' || status === 'IN_PROGRESS'
      }
    ];

    return (
      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step.completed 
                ? 'bg-green-600 text-white' 
                : step.current 
                  ? 'bg-yellow-400 text-white' 
                  : 'bg-gray-300 text-gray-500'
            }`}>
              {step.completed ? '✓' : step.current ? '!' : step.id}
            </div>
            <div className="ml-4">
              <p className={`font-medium ${
                step.completed || step.current ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {step.title}
              </p>
              <p className={`text-sm ${
                step.completed || step.current ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCustomerActionItems = () => {
    const status = booking?.status;
    
    const steps = [
      {
        id: 1,
        title: "Booking Submitted",
        description: "Your booking request has been sent to the provider",
        completed: true,
        current: false
      },
      {
        id: 2,
        title: "Provider Confirmation",
        description: status === 'CONFIRMED' 
          ? "Provider has confirmed your booking" 
          : status === 'CANCELLED' 
            ? "Booking was cancelled" 
            : "Wait for the provider to confirm your booking",
        completed: status === 'CONFIRMED' || status === 'IN_PROGRESS' || status === 'COMPLETED',
        current: status === 'PENDING'
      },
      {
        id: 3,
        title: "Service Completion",
        description: status === 'COMPLETED' 
          ? "Service has been completed successfully" 
          : "Service will be provided on the scheduled date",
        completed: status === 'COMPLETED',
        current: status === 'CONFIRMED' || status === 'IN_PROGRESS'
      }
    ];

    return (
      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step.completed 
                ? 'bg-green-600 text-white' 
                : step.current 
                  ? 'bg-yellow-400 text-white' 
                  : 'bg-gray-300 text-gray-500'
            }`}>
              {step.completed ? '✓' : step.current ? step.id : step.id}
            </div>
            <div className="ml-4">
              <p className={`font-medium ${
                step.completed || step.current ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {step.title}
              </p>
              <p className={`text-sm ${
                step.completed || step.current ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="text-red-600 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h2>
        <p className="text-gray-600 mb-6">The booking you're looking for doesn't exist or you don't have permission to view it.</p>
        <Link 
          to="/services-map" 
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Browse Services
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="text-green-600 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {user?.role === 'PROVIDER' ? 'Service Request Details' : 'Booking Confirmed!'}
        </h1>
        <p className="text-gray-600">
          {user?.role === 'PROVIDER' 
            ? 'Review the service request details and manage the booking.' 
            : 'Your service booking has been successfully created.'
          }
        </p>
      </div>

      {/* Booking Details Card */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="bg-blue-600 text-white px-6 py-4">
          <h2 className="text-xl font-semibold">Booking Details</h2>
          <p className="text-blue-100">Booking ID: #{booking.id}</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Service Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {user?.role === 'PROVIDER' ? 'Customer & Service Details' : 'Service Information'}
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Service:</span>
                  <p className="text-gray-900">{booking.service?.title || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    {user?.role === 'PROVIDER' ? 'Customer:' : 'Provider:'}
                  </span>
                  <p className="text-gray-900">
                    {user?.role === 'PROVIDER' 
                      ? (booking.customer?.name || 'N/A')
                      : (booking.provider?.name || booking.service?.provider?.name || 'N/A')
                    }
                  </p>
                </div>
                {user?.role === 'PROVIDER' && booking.customer?.email && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Customer Email:</span>
                    <p className="text-gray-900">{booking.customer.email}</p>
                  </div>
                )}
                {user?.role === 'PROVIDER' && booking.customer?.phone && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Customer Phone:</span>
                    <p className="text-gray-900">{booking.customer.phone}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-500">Category:</span>
                  <p className="text-gray-900">{booking.service?.category || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Location:</span>
                  <p className="text-gray-900">{booking.service?.location || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Booking Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Date & Time:</span>
                  <p className="text-gray-900">
                    {booking.bookingDate && new Date(booking.bookingDate).toLocaleDateString()} at {booking.timeSlot}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status || 'PENDING'}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Booking Details:</span>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md mt-1">{booking.notes || 'No additional details'}</p>
                </div>
              </div>
            </div>
          </div>



          {/* Booking Timeline */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {user?.role === 'PROVIDER' ? 'Action Items' : 'What\'s Next?'}
            </h3>
            
            {user?.role === 'PROVIDER' ? renderProviderActionItems() : renderCustomerActionItems()}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {user?.role === 'PROVIDER' && booking.status === 'PENDING' && (
          <>
            <button
              onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
              className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 text-center font-medium"
            >
              Accept Booking
            </button>
            <button
              onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
              className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 text-center font-medium"
            >
              Decline Booking
            </button>
          </>
        )}
        
        {/* Chat Button - Available for all statuses except cancelled */}
        {booking.status !== 'CANCELLED' && (
          <button
            onClick={startChat}
            className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 text-center font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Start Chat
          </button>
        )}
        
        <Link
          to="/dashboard"
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 text-center font-medium"
        >
          Go to Dashboard
        </Link>
        <Link
          to={user?.role === 'PROVIDER' ? "/bookings" : "/services"}
          className="bg-gray-100 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-200 text-center font-medium"
        >
          {user?.role === 'PROVIDER' ? 'Manage Bookings' : 'Browse More Services'}
        </Link>
        <button
          onClick={() => window.print()}
          className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 font-medium"
        >
          Print Confirmation
        </button>
      </div>

      {/* Contact Information */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
        <p className="text-blue-700 mb-4">
          If you have any questions about your booking, please contact our support team.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="mailto:support@fixitnow.com"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            📧 support@fixitnow.com
          </a>
          <a
            href="tel:+1234567890"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            📞 +1 (234) 567-890
          </a>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;