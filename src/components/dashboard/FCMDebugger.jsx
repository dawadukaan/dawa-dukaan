import { useState } from 'react';
import { requestNotificationPermission } from '@/lib/firebase/firebase';
import { registerAdminFCMToken } from '@/lib/fcm/adminTokenManager';
import toast from 'react-hot-toast';

export default function FCMDebugger() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const addLog = (message, type = 'info') => {
    console.log(`[FCMDebugger] ${type.toUpperCase()}: ${message}`);
    setLogs(prev => [
      { id: Date.now(), message, type, time: new Date().toLocaleTimeString() },
      ...prev
    ].slice(0, 20));
  };
  
  const handleTestPermission = async () => {
    setLoading(true);
    addLog('Testing notification permission...');
    
    try {
      if (!("Notification" in window)) {
        addLog('Notifications not supported in this browser', 'error');
        return;
      }
      
      addLog(`Current permission status: ${Notification.permission}`);
      
      if (Notification.permission !== "granted") {
        addLog('Requesting permission...', 'warning');
        const result = await Notification.requestPermission();
        addLog(`Permission request result: ${result}`, 
               result === 'granted' ? 'success' : 'error');
      } else {
        addLog('Permission already granted', 'success');
      }
    } catch (error) {
      addLog(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTestToken = async () => {
    setLoading(true);
    addLog('Testing FCM token generation...');
    
    try {
      const token = await requestNotificationPermission();
      if (token) {
        addLog(`Token generated: ${token.substring(0, 12)}...`, 'success');
      } else {
        addLog('No token generated', 'error');
      }
    } catch (error) {
      addLog(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRegisterToken = async () => {
    setLoading(true);
    addLog('Testing token registration with server...');
    
    try {
      const token = await requestNotificationPermission();
      if (!token) {
        addLog('No token available to register', 'error');
        return;
      }
      
      addLog(`Using token: ${token.substring(0, 12)}...`);
      
      const deviceInfo = {
        browser: navigator.userAgent.match(/(firefox|msie|chrome|safari|trident)/i)?.[1] || 'Unknown',
        os: navigator.userAgent.match(/windows|mac|linux|android|iphone|ipad/i)?.[0] || 'Unknown',
        name: `Debug Test (${new Date().toLocaleTimeString()})`
      };
      
      addLog(`Device info: ${JSON.stringify(deviceInfo)}`);
      
      const result = await registerAdminFCMToken(token, deviceInfo);
      addLog(`Registration success: ${JSON.stringify(result)}`, 'success');
      toast.success('Token registered successfully');
    } catch (error) {
      addLog(`Registration error: ${error.message}`, 'error');
      toast.error('Token registration failed');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTestNotification = () => {
    setLoading(true);
    addLog('Testing local notification...');
    
    try {
      if (!("Notification" in window)) {
        addLog('Notifications not supported', 'error');
        return;
      }
      
      if (Notification.permission !== "granted") {
        addLog('Permission not granted', 'error');
        return;
      }
      
      new Notification('Test Notification', {
        body: 'This is a test notification from FCM Debugger',
        icon: '/images/logo.png'
      });
      
      addLog('Local notification displayed', 'success');
    } catch (error) {
      addLog(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-medium mb-4">FCM Debugging Tools</h3>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={handleTestPermission}
          disabled={loading}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
        >
          Test Permission
        </button>
        <button
          onClick={handleTestToken}
          disabled={loading}
          className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
        >
          Get FCM Token
        </button>
        <button
          onClick={handleRegisterToken}
          disabled={loading}
          className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50"
        >
          Register Token
        </button>
        <button
          onClick={handleTestNotification}
          disabled={loading}
          className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 disabled:opacity-50"
        >
          Test Local Notification
        </button>
      </div>
      
      {loading && (
        <div className="flex justify-center my-2">
          <div className="w-5 h-5 border-t-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      
      <div className="border rounded overflow-hidden">
        <div className="bg-gray-100 px-3 py-1 text-xs font-medium">Debug Logs</div>
        <div className="max-h-60 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="p-3 text-center text-gray-500 text-sm">No logs yet. Run a test.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {logs.map(log => (
                <div 
                  key={log.id} 
                  className={`px-3 py-1.5 text-xs ${
                    log.type === 'error' ? 'bg-red-50 text-red-600' :
                    log.type === 'warning' ? 'bg-yellow-50 text-yellow-600' :
                    log.type === 'success' ? 'bg-green-50 text-green-600' :
                    'text-gray-600'
                  }`}
                >
                  <span className="text-gray-400 mr-1">{log.time}</span>
                  {log.message}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 