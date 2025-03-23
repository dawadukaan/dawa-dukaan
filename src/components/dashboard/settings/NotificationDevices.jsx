import { useState, useEffect } from 'react';
import { FiSmartphone, FiTrash2, FiRefreshCw, FiInfo } from 'react-icons/fi';
import { getAdminFCMTokens, deleteAdminFCMToken, deleteAllAdminFCMTokens } from '@/lib/fcm/adminTokenManager';
import { toast } from 'react-hot-toast';

export default function NotificationDevices() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  
  const fetchTokens = async () => {
    try {
      setLoading(true);
      const fetchedTokens = await getAdminFCMTokens();
      setTokens(fetchedTokens);
    } catch (error) {
      toast.error('Failed to load notification devices');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTokens();
  }, []);
  
  const handleDeleteToken = async (tokenId) => {
    if (confirm('Are you sure you want to remove this device?')) {
      try {
        setDeleting(tokenId);
        await deleteAdminFCMToken(tokenId);
        toast.success('Device removed successfully');
        setTokens(tokens.filter(token => token._id !== tokenId));
      } catch (error) {
        toast.error('Failed to remove device');
        console.error(error);
      } finally {
        setDeleting(null);
      }
    }
  };
  
  const handleDeleteAllTokens = async () => {
    if (confirm('Are you sure you want to remove all devices? You will no longer receive notifications on any device.')) {
      try {
        setLoading(true);
        await deleteAllAdminFCMTokens();
        toast.success('All devices removed successfully');
        setTokens([]);
      } catch (error) {
        toast.error('Failed to remove all devices');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-semibold text-gray-800">Notification Devices</h2>
        <div className="flex space-x-2">
          <button 
            onClick={fetchTokens}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
            title="Refresh devices"
          >
            <FiRefreshCw />
          </button>
          {tokens.length > 0 && (
            <button 
              onClick={handleDeleteAllTokens}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition"
              title="Remove all devices"
            >
              <FiTrash2 />
            </button>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="py-10 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : tokens.length === 0 ? (
        <div className="py-8 flex flex-col items-center text-center">
          <div className="bg-blue-50 rounded-full p-3 mb-3">
            <FiInfo className="h-6 w-6 text-blue-500" />
          </div>
          <p className="text-gray-600 mb-1">No notification devices registered</p>
          <p className="text-gray-500 text-sm max-w-md">
            When you allow notifications on this device, it will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tokens.map(token => (
            <div key={token._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <FiSmartphone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">{token.device || 'Unknown Device'}</h3>
                  <p className="text-xs text-gray-500">
                    Added {new Date(token.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => handleDeleteToken(token._id)}
                disabled={deleting === token._id}
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition disabled:opacity-50"
              >
                {deleting === token._id ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                ) : (
                  <FiTrash2 />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 