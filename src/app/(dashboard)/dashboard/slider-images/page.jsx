// src/app/(dashboard)/dashboard/slider-images/page.jsx

'use client';

import { useState, useEffect } from 'react';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiX,
  FiUpload,
  FiAlertCircle
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import env from '@/lib/config/env';
import { getCookie } from 'cookies-next';

const SliderFormModal = ({ show, onClose, title, initialData, onSubmit, isUploading, onImageUpload }) => {
  const [localFormData, setLocalFormData] = useState({
    title: '',
    description: '',
    image: '',
    link: '',
    isActive: true
  });

  // Update local form data when initialData changes
  useEffect(() => {
    if (show) {
      setLocalFormData(initialData);
    }
  }, [show, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(localFormData);
  };

  const handleImageChange = async (file) => {
    if (file) {
      const imageUrl = await onImageUpload(file);
      if (imageUrl) {
        setLocalFormData(prev => ({ ...prev, image: imageUrl }));
      }
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto">
      <div className="relative bg-white rounded-lg w-full max-w-2xl mx-4 my-8" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
        {/* Header - Fixed */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-lg z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form Content - Scrollable */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Title Input */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={localFormData.title}
                  onChange={(e) => setLocalFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter slider title"
                  required
                />
              </div>

              {/* Description Input */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={localFormData.description}
                  onChange={(e) => setLocalFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter slider description"
                  rows="3"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex flex-col space-y-4">
                  {localFormData.image ? (
                    <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={localFormData.image} 
                        alt="Preview" 
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => setLocalFormData(prev => ({ ...prev, image: '' }))}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">Click to upload image</p>
                          <p className="text-xs text-gray-500 mt-1">16:9 aspect ratio (1920×1080)</p>
                          <p className="text-xs text-gray-500">Max size 1MB • PNG, JPG, JPEG</p>
                        </div>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              handleImageChange(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Link Input */}
              <div>
                <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">
                  Link URL
                </label>
                <input
                  id="link"
                  type="url"
                  value={localFormData.link}
                  onChange={(e) => setLocalFormData(prev => ({ ...prev, link: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="https://example.com"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-3">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={localFormData.isActive}
                  onChange={(e) => setLocalFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="text-sm text-gray-900">
                  Active
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Fixed */}
        <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 rounded-b-lg">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isUploading || !localFormData.title || !localFormData.image}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Uploading...
                </span>
              ) : (
                title === 'Edit Slider' ? 'Update Slider' : 'Create Slider'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmationModal = ({ show, onClose, onConfirm }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 p-6">
        <div className="text-center">
          <FiAlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Delete Slider
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Are you sure you want to delete this slider? This action cannot be undone.
          </p>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default function SliderImagesPage() {
  const [sliders, setSliders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSlider, setSelectedSlider] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    link: '',
    isActive: true
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sliderToDelete, setSliderToDelete] = useState(null);

  // Fetch sliders
  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      const token = getCookie('token');
      setIsLoading(true);
      const response = await fetch(`${env.app.apiUrl}/admin/slider-images`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setSliders(data.data);
      } else {
        toast.error('Failed to fetch slider images');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load slider images');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return null;

    // Check file size (less than 1MB)
    const fileSize = file.size / 1024;
    if (fileSize > 1024) {
      toast.error('Image size must be less than 1MB');
      return null;
    }

    // Check image dimensions
    const img = new Image();
    img.src = URL.createObjectURL(file);
    const isValidRatio = await new Promise((resolve) => {
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        const aspectRatio = img.width / img.height;
        const expectedRatio = 16 / 9;
        const tolerance = 0.1;

        if (Math.abs(aspectRatio - expectedRatio) > tolerance) {
          toast.error('Image must have a 16:9 aspect ratio (1920×1080 recommended)');
          resolve(false);
          return;
        }
        resolve(true);
      };
    });

    if (!isValidRatio) return null;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'slider-images');

    setUploadingImage(true);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Image uploaded successfully');
        return data.data.url; // Return the image URL
      } else {
        toast.error('Failed to upload image');
        return null;
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (formData) => {
    const token = getCookie('token');

    try {
      const url = selectedSlider 
        ? `${env.app.apiUrl}/admin/slider-images/${selectedSlider._id}`
        : `${env.app.apiUrl}/admin/slider-images`;
      
      const method = selectedSlider ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        toast.success(selectedSlider ? 'Slider updated successfully' : 'Slider added successfully');
        fetchSliders();
        handleCloseModal();
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    setSliderToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!sliderToDelete) return;

    const token = getCookie('token');
    try {
      const response = await fetch(`${env.app.apiUrl}/admin/slider-images/${sliderToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Slider deleted successfully');
        fetchSliders();
      } else {
        toast.error(data.error || 'Failed to delete slider');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete slider');
    } finally {
      setShowDeleteModal(false);
      setSliderToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedSlider(null);
    setFormData({
      title: '',
      description: '',
      image: '',
      link: '',
      isActive: true
    });
  };

  const handleEdit = (slider) => {
    setSelectedSlider(slider);
    setFormData({
      title: slider.title,
      description: slider.description || '',
      image: slider.image,
      link: slider.link || '',
      isActive: slider.isActive
    });
    setShowEditModal(true);
  };

  const handleToggleActive = async (slider) => {
    const token = getCookie('token');
    try {
      const response = await fetch(`${env.app.apiUrl}/admin/slider-images/${slider._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...slider,
          isActive: !slider.isActive
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Slider ${!slider.isActive ? 'activated' : 'deactivated'} successfully`);
        fetchSliders(); // Refresh the list
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update slider status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Slider Images</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <FiPlus className="w-5 h-5 mr-2" />
          Add Slider
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading sliders...</p>
        </div>
      )}

      {/* Sliders Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sliders.length > 0 ? (
            sliders.map((slider) => (
              <div key={slider._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={slider.image}
                    alt={slider.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => handleToggleActive(slider)}
                      className={`
                        px-3 py-1 rounded-full transition-colors duration-200 flex items-center gap-2
                        ${slider.isActive 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'}
                      `}
                    >
                      <span className={`
                        w-2 h-2 rounded-full
                        ${slider.isActive ? 'bg-green-500' : 'bg-red-500'}
                      `}></span>
                      <span className="text-xs font-medium">
                        {slider.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900">{slider.title}</h3>
                  {slider.description && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{slider.description}</p>
                  )}
                  {slider.link && (
                    <a
                      href={slider.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-sm text-blue-600 hover:underline"
                    >
                      View Link
                    </a>
                  )}
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(slider)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(slider._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-xl shadow-sm p-8 text-center">
              <FiAlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No sliders found</h3>
              <p className="text-gray-500">Add your first slider image to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <SliderFormModal
        show={showAddModal}
        onClose={handleCloseModal}
        title="Add New Slider"
        initialData={formData}
        onSubmit={handleSubmit}
        isUploading={uploadingImage}
        onImageUpload={handleImageUpload}
      />
      <SliderFormModal
        show={showEditModal}
        onClose={handleCloseModal}
        title="Edit Slider"
        initialData={formData}
        onSubmit={handleSubmit}
        isUploading={uploadingImage}
        onImageUpload={handleImageUpload}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSliderToDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
