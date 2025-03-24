// src/app/(dashboard)/dashboard/app-updates/release/page.jsx

'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiUpload, FiX, FiInfo } from 'react-icons/fi';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import env from '@/lib/config/env';
import { getCookie } from 'cookies-next';

export default function ReleaseAppUpdatePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [update, setUpdate] = useState({
    version: '',
    releaseNotes: '',
    apkUrl: '',
    instructions: '',
    releaseDate: new Date().toISOString().split('T')[0]
  });

  // Add file input ref for APK upload
  const fileInputRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Add to the state
  const [sendNotification, setSendNotification] = useState(true);

  // Add a toggle between file upload and direct URL
  const [uploadMethod, setUploadMethod] = useState('url'); // 'url' or 'file'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdate(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = [
      { field: 'version', label: 'Version' },
      { field: 'releaseNotes', label: 'Release Notes' },
      { field: 'apkUrl', label: 'APK URL' },
      { field: 'instructions', label: 'Instructions' }
    ];

    for (const { field, label } of requiredFields) {
      if (!update[field]?.trim()) {
        toast.error(`${label} is required`);
        return;
      }
    }

    // Validate version format (semantic versioning)
    const versionRegex = /^\d+\.\d+\.\d+$/;
    if (!versionRegex.test(update.version)) {
      toast.error('Version must follow semantic versioning (e.g., 1.0.0)');
      return;
    }

    setIsSaving(true);

    try {
      const token = getCookie('token');
      
      // 1. First create the app update
      const updateResponse = await fetch(`${env.app.apiUrl}/admin/app-updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(update)
      });

      if (!updateResponse.ok) {
        const data = await updateResponse.json();
        throw new Error(data.error || 'Failed to create update');
      }

      if (sendNotification) {
        // 2. Send notification to all users about the update
        const notificationResponse = await fetch(`${env.app.apiUrl}/notifications/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: `New Update v${update.version} Available`,
            body: `A new version of the app is available. ${update.releaseNotes.split('\n')[0]}`, // First line of release notes
            data: {
              type: 'app_update',
              version: update.version,
              apkUrl: update.apkUrl,
              releaseDate: update.releaseDate
            },
            type: 'alert', // notification type
          })
        });

        if (!notificationResponse.ok) {
          // Log notification error but don't throw (update was successful)
          console.error('Failed to send notifications:', await notificationResponse.json());
          toast.success('App update released successfully (notification sending failed)');
        } else {
          const notificationData = await notificationResponse.json();
          console.log('Notification sent:', notificationData);
          toast.success('App update released and notifications sent successfully');
        }
      }

      router.push('/dashboard/app-updates');
      router.refresh();
    } catch (error) {
      console.error('Error in release process:', error);
      toast.error(error.message || 'Failed to release update');
    } finally {
      setIsSaving(false);
    }
  };

  // Add APK upload handler
  const handleApkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type and size
    if (!file.name.endsWith('.apk')) {
      toast.error('Please upload a valid APK file');
      return;
    }

    // Check file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (file.size > maxSize) {
      toast.error('APK file size must be less than 100MB');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const loadingToast = toast.loading('Uploading APK file...');
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return 90;
          return prev + 5;
        });
      }, 1000);

      const formData = new FormData();
      formData.append('file', file);
      
      const token = getCookie('token');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

      const response = await fetch(`${env.app.apiUrl}/admin/app-updates/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      setUploadProgress(100);
      const data = await response.json();

      if (data.success && data.data?.url) {
        setUpdate(prev => ({
          ...prev,
          apkUrl: data.data.url || ''
        }));
        toast.success('APK uploaded successfully');
      } else {
        throw new Error('Failed to upload APK');
      }

      // Dismiss loading toast
      toast.dismiss(loadingToast);
    } catch (error) {
      console.error('Error uploading APK:', error);
      
      let errorMessage = 'Failed to upload APK';
      if (error.name === 'AbortError') {
        errorMessage = 'Upload timeout - please try again with a smaller file or better connection';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Add this function
  const handleUploadMethodChange = (method) => {
    setUploadMethod(method);
    // Reset the APK URL when switching methods
    setUpdate(prev => ({
      ...prev,
      apkUrl: ''
    }));
    // Reset file input if switching from file upload
    if (method === 'url' && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Release New Update</h1>
        <div className="flex gap-2">
          <Link 
            href="/dashboard/app-updates" 
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Releasing...
              </>
            ) : (
              <>
                <FiSave className="w-5 h-5 mr-2" />
                Release Update
              </>
            )}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start">
              <FiInfo className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-blue-700 text-sm">
                <p className="font-medium">Important Release Guidelines:</p>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>Use semantic versioning (e.g., 1.0.0)</li>
                  <li>Provide clear and detailed release notes</li>
                  <li>Include step-by-step update instructions</li>
                  <li>Ensure the APK file is properly uploaded and accessible</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-1">
                Version Number <span className="text-red-500">*</span>
              </label>
              <input
                id="version"
                name="version"
                type="text"
                required
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={update.version}
                onChange={handleChange}
                placeholder="e.g., 1.0.0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Follow semantic versioning: MAJOR.MINOR.PATCH
              </p>
            </div>

            <div>
              <label htmlFor="releaseDate" className="block text-sm font-medium text-gray-700 mb-1">
                Release Date
              </label>
              <input
                id="releaseDate"
                name="releaseDate"
                type="date"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={update.releaseDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Upload Method</label>
            <div className="mt-2">
              <select
                value={uploadMethod}
                onChange={(e) => handleUploadMethodChange(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                <option value="url">Direct URL</option>
                <option value="file">File Upload</option>
              </select>
            </div>
          </div>

          {uploadMethod === 'url' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700">APK URL</label>
              <input
                type="url"
                value={update.apkUrl || ''}
                onChange={(e) => setUpdate(prev => ({ 
                  ...prev, 
                  apkUrl: e.target.value 
                }))}
                placeholder="https://example.com/your-app.apk"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter a direct download URL for your APK file
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700">Upload APK</label>
              <input
                type="file"
                ref={fileInputRef}
                accept=".apk"
                onChange={handleApkUpload}
                className="mt-1 block w-full"
              />
              {update.apkUrl && (
                <p className="mt-2 text-sm text-green-600">
                  File uploaded: {update.apkUrl.split('/').pop()}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Maximum file size: 50MB. For larger files, please use direct URL upload.
              </p>
            </div>
          )}

          {/* Upload progress indicator */}
          {isUploading && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div 
                  className="bg-blue-500 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-blue-700 font-medium">{uploadProgress}% Uploading APK...</p>
            </div>
          )}

          <div>
            <label htmlFor="releaseNotes" className="block text-sm font-medium text-gray-700 mb-1">
              Release Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              id="releaseNotes"
              name="releaseNotes"
              rows="5"
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={update.releaseNotes}
              onChange={handleChange}
              placeholder="• New features added&#10;• Bugs fixed&#10;• Performance improvements"
            />
            <p className="text-xs text-gray-500 mt-1">
              List new features, improvements, and bug fixes
            </p>
          </div>

          <div>
            <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
              Update Instructions <span className="text-red-500">*</span>
            </label>
            <textarea
              id="instructions"
              name="instructions"
              rows="4"
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={update.instructions}
              onChange={handleChange}
              placeholder="1. Download the new APK&#10;2. Install the update&#10;3. Additional steps if needed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Provide clear step-by-step instructions for users to update
            </p>
          </div>

          {/* Add this to the form, before the submit button */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="sendNotification"
              checked={sendNotification}
              onChange={(e) => setSendNotification(e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="sendNotification" className="ml-2 block text-sm text-gray-700">
              Send notification to all users about this update
            </label>
          </div>
        </form>
      </div>
    </div>
  );
}
