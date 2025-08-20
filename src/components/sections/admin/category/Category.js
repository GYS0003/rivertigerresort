'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiEdit, FiTrash2, FiPlus, FiUpload, FiX } from 'react-icons/fi';

const Category = () => {
  const [stays, setStays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStay, setEditingStay] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const fileInputRef = useRef(null);
  const router = useRouter();

  const categories = ['tents', 'villas', 'cottages'];

  const fetchStays = async () => {
    try {
      const res = await fetch('/api/stay');
      const data = await res.json();
      setStays(data);
    } catch (error) {
      console.error('Error fetching stays:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStays();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Remove the images field from formData
    formData.delete('images');
    
    // Only append new images if they exist
    newImages.forEach(file => {
      formData.append('images', file);
    });
    
    // Append images to delete only if needed
    if (imagesToDelete.length > 0) {
      imagesToDelete.forEach(id => formData.append('deleteImages', id));
    }

    try {
      let response;
      if (editingStay) {
        response = await fetch(`/api/stay?id=${editingStay._id}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        response = await fetch('/api/stay', {
          method: 'POST',
          body: formData,
        });
      }

      const result = await response.json();
      if (result.success) {
        fetchStays();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error saving stay:', error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this stay?')) {
      try {
        const response = await fetch(`/api/stay?id=${id}`, {
          method: 'DELETE',
        });
        const result = await response.json();
        if (result.success) {
          fetchStays();
        }
      } catch (error) {
        console.error('Error deleting stay:', error);
      }
    }
  };

  const handleEdit = (stay) => {
    setEditingStay(stay);
    setImagePreviews(stay.images || []);
    setImagesToDelete([]);
    setNewImages([]);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingStay(null);
    setImagePreviews([]);
    setImagesToDelete([]);
    setNewImages([]);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStay(null);
    setImagePreviews([]);
    setImagesToDelete([]);
    setNewImages([]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    
    setImagePreviews(prev => [...prev, ...newPreviews]);
    setNewImages(prev => [...prev, ...files]);
  };

  const removeImage = (index, isExisting = false) => {
    if (isExisting) {
      // For existing images, track which ones to delete
      const url = imagePreviews[index];
      const publicId = url.split('/').pop().split('.')[0];
      setImagesToDelete(prev => [...prev, publicId]);
    } else {
      // For new images, remove from the newImages array
      const updatedImages = [...newImages];
      updatedImages.splice(index - (imagePreviews.length - newImages.length), 1);
      setNewImages(updatedImages);
    }
    
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Stays</h1>
        {/* <button
          onClick={handleAddNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
        >
          <FiPlus className="mr-2" /> Add New Stay
        </button> */}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stays.map((stay) => (
            <div key={stay._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 relative">
                {stay.images?.[0] && (
                  <img
                    src={stay.images[0]}
                    alt={stay.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold">{stay.name}</h2>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {stay.category}
                  </span>
                </div>
                <p className="text-gray-600 mt-2">₹{stay.price} per night</p>
                <p className="text-gray-600">Max guests: {stay.maxGuests}</p>
                <div className="flex mt-4 space-x-2">
                  <button
                    onClick={() => handleEdit(stay)}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <FiEdit className="mr-1" /> Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-semibold">
                {editingStay ? 'Edit Stay' : 'Add New Stay'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <FiX size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    defaultValue={editingStay?.category || ''}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingStay?.name || ''}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    defaultValue={editingStay?.price || ''}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Max Guests</label>
                  <input
                    type="number"
                    name="maxGuests"
                    defaultValue={editingStay?.maxGuests || ''}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div className="mb-4 md:col-span-2">
                  <label className="block text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    defaultValue={editingStay?.description || ''}
                    className="w-full p-2 border rounded"
                    rows="3"
                  />
                </div>

                <div className="mb-4 md:col-span-2">
                  <label className="block text-gray-700 mb-2">Amenities (comma separated)</label>
                  <input
                    type="text"
                    name="amenities"
                    defaultValue={editingStay?.amenities?.join(', ') || ''}
                    className="w-full p-2 border rounded"
                    placeholder="WiFi, Pool, AC, etc."
                  />
                </div>

                <div className="mb-4 md:col-span-2">
                  <label className="block text-gray-700 mb-2">Special Notes</label>
                  <textarea
                    name="specialNotes"
                    defaultValue={editingStay?.specialNotes || ''}
                    className="w-full p-2 border rounded"
                    rows="2"
                  />
                </div>

                <div className="mb-4 md:col-span-2">
                  <label className="block text-gray-700 mb-2">Images</label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {imagePreviews.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={img}
                          alt={`Preview ${index}`}
                          className="w-24 h-24 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(
                            index, 
                            editingStay && img.startsWith('http')
                          )}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                        >
                          <FiX size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <label className="flex flex-col items-center px-4 py-6 bg-white rounded-lg border border-dashed cursor-pointer">
                    <FiUpload className="text-gray-500 text-2xl mb-2" />
                    <span className="text-gray-700">Upload Images</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      name="images"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                      accept="image/*"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-4 p-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingStay ? 'Update Stay' : 'Add Stay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;