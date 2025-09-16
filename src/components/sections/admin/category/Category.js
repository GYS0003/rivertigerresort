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
  const [deleteLoading, setDeleteLoading] = useState(null);
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

  const toggleDisabled = async (stayId) => {
    try {
      const stayToUpdate = stays.find(s => s._id === stayId);
      const newDisabledStatus = !stayToUpdate.isDisabled;

      const response = await fetch(`/api/stay?id=${stayId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isDisabled: newDisabledStatus
        }),
      });

      if (response.ok) {
        setStays(stays.map(stay =>
          stay._id === stayId
            ? { ...stay, isDisabled: newDisabledStatus }
            : stay
        ));
      }
    } catch (error) {
      console.error('Error toggling disabled status:', error);
      alert('Failed to update status');
    }
  };

  const handleAddNew = () => {
    setEditingStay(null);
    setImagePreviews([]);
    setImagesToDelete([]);
    setNewImages([]);
    setShowModal(true);
  };

  const handleDelete = async (id, stayName) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to permanently delete "${stayName}"?\n\nThis action cannot be undone.`
    );

    if (!isConfirmed) return;

    setDeleteLoading(id);

    try {
      const response = await fetch(`/api/stay?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setStays(stays.filter(stay => stay._id !== id));
        alert('Stay deleted successfully!');
      } else {
        throw new Error(result.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting stay:', error);
      alert('Failed to delete stay. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const meals = formData.get('meals') === 'true' ?true : false;
    const isDisabled = formData.get('isDisabled') === 'true' ? true : false;
    if(meals === true){
      if(formData.get('breakfastPrice') === ''){
        alert('Please enter breakfast price');
        return;
      }
      if(formData.get('lunchPrice') === ''){
        alert('Please enter lunch price');
        return;
      }
      if(formData.get('dinnerPrice') === ''){
        alert('Please enter dinner price');
        return;
      }
    }
    formData.delete('images');
    formData.delete('meals');
    formData.delete('isDisabled');

    formData.append('meals', meals);
    formData.append('isDisabled', isDisabled);

    newImages.forEach(file => {
      formData.append('images', file);
    });

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
        alert(editingStay ? 'Stay updated successfully!' : 'Stay created successfully!');
      } else {
        throw new Error(result.message || 'Save failed');
      }
    } catch (error) {
      console.error('Error saving stay:', error);
      alert('Failed to save stay. Please try again.');
    }
  };

  const handleEdit = (stay) => {
    setEditingStay(stay);
    setImagePreviews(stay.images || []);
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
      const url = imagePreviews[index];
      const publicId = url.split('/').pop().split('.')[0];
      setImagesToDelete(prev => [...prev, publicId]);
    } else {
      const updatedImages = [...newImages];
      updatedImages.splice(index - (imagePreviews.length - newImages.length), 1);
      setNewImages(updatedImages);
    }

    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // **UPDATED: Only show meal prices if meals are enabled**
  const getMealPrices = (stay) => {
    if (!stay.meals) return []; // Return empty if meals are disabled

    const meals = [];
    if (stay.breakfastPrice && stay.breakfastPrice > 0) {
      meals.push(`Breakfast: ₹${stay.breakfastPrice}`);
    }
    if (stay.lunchPrice && stay.lunchPrice > 0) {
      meals.push(`Lunch: ₹${stay.lunchPrice}`);
    }
    if (stay.dinnerPrice && stay.dinnerPrice > 0) {
      meals.push(`Dinner: ₹${stay.dinnerPrice}`);
    }
    return meals;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Stays</h1>
          <p className="text-gray-600 mt-1">Total Stays: {stays.length}</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md"
        >
          <FiPlus className="mr-2" size={20} />
          Add New Stay
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-600">Loading stays...</p>
        </div>
      ) : stays.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <FiPlus className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No stays found</h3>
          <p className="text-gray-500 mb-6">Get started by adding your first stay.</p>
          <button
            onClick={handleAddNew}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Your First Stay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stays.map((stay) => {
            const mealPrices = getMealPrices(stay);
            const isDeleting = deleteLoading === stay._id;

            return (
              <div key={stay._id} className={`bg-white rounded-lg shadow-md overflow-hidden relative transition-all duration-200 ${stay.isDisabled
                ? 'grayscale opacity-70 hover:opacity-80' // **ENHANCED: Grayscale effect for disabled stays**
                : ''
                } ${isDeleting ? 'pointer-events-none opacity-50' : ''}`}>

                {/* Toggle Switch on Card */}
                <div className="absolute top-3 right-3 z-10 bg-white bg-opacity-90 rounded-lg p-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-medium ${stay.isDisabled ? 'text-red-600' : 'text-green-600'
                      }`}>
                      {stay.isDisabled ? 'Disabled' : 'Active'}
                    </span>
                    <button
                      onClick={() => toggleDisabled(stay._id)}
                      disabled={isDeleting}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${stay.isDisabled ? 'bg-red-400' : 'bg-green-500'
                        }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${stay.isDisabled ? 'translate-x-0.5' : 'translate-x-4.5'
                          }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="h-48 bg-gray-200 relative">
                  {stay.images?.[0] && (
                    <img
                      src={stay.images[0]}
                      alt={stay.name}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* **UPDATED: Disabled overlay with better styling** */}
                  {stay.isDisabled && (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-transparent to-gray-900 bg-opacity-60 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-white font-bold text-lg bg-red-600 px-3 py-1 rounded-lg shadow-lg">
                          DISABLED
                        </span>
                        <p className="text-white text-sm mt-1 bg-black bg-opacity-40 px-2 py-1 rounded">
                          Not available for booking
                        </p>
                      </div>
                    </div>
                  )}

                  {isDeleting && (
                    <div className="absolute inset-0 bg-red-500 bg-opacity-40 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                        <span className="font-medium">Deleting...</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h2 className={`text-xl font-semibold ${stay.isDisabled ? 'text-gray-600' : 'text-gray-900'
                      }`}>
                      {stay.name}
                    </h2>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`text-xs px-2 py-1 rounded ${stay.isDisabled
                        ? 'bg-gray-200 text-gray-600'
                        : 'bg-blue-100 text-blue-800'
                        }`}>
                        {stay.category}
                      </span>

                      {/* **UPDATED: Only show meals badge if meals are enabled** */}
                      {stay.meals && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          Meals Available
                        </span>
                      )}

                      {/* **NEW: Show "No Meals" badge if meals are disabled** */}
                      {!stay.meals && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                          No Meals
                        </span>
                      )}
                    </div>
                  </div>

                  <p className={`mt-2 ${stay.isDisabled ? 'text-gray-500' : 'text-gray-600'}`}>
                    ₹{stay.price} per night
                  </p>
                  <p className={stay.isDisabled ? 'text-gray-500' : 'text-gray-600'}>
                    Max guests: {stay.maxGuests}
                  </p>

                  {/* **UPDATED: Only show meal prices if meals are enabled** */}
                  {mealPrices.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 font-medium">Meal Prices:</p>
                      {mealPrices.map((meal, idx) => (
                        <p key={idx} className="text-xs text-gray-600">{meal}</p>
                      ))}
                    </div>
                  )}

                  {/* **NEW: Show message when meals are disabled** */}
                  {!stay.meals && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-400 italic">Meals not available for this stay</p>
                    </div>
                  )}

                  <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(stay)}
                      disabled={isDeleting}
                      className={`flex items-center font-medium transition-colors ${stay.isDisabled
                        ? 'text-gray-500 hover:text-gray-600'
                        : 'text-blue-600 hover:text-blue-800'
                        }`}
                    >
                      <FiEdit className="mr-1" size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(stay._id, stay.name)}
                      disabled={isDeleting}
                      className="flex items-center text-red-600 hover:text-red-800 font-medium transition-colors"
                    >
                      {isDeleting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-1"></div>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <FiTrash2 className="mr-1" size={16} />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-semibold">
                {editingStay ? `Edit "${editingStay.name}"` : 'Add New Stay'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <FiX size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 font-medium">Category *</label>
                  <select
                    name="category"
                    defaultValue={editingStay?.category || ''}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <label className="block text-gray-700 mb-2 font-medium">Name *</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingStay?.name || ''}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    placeholder="Enter stay name"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 font-medium">Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    defaultValue={editingStay?.price || ''}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    min="0"
                    placeholder="Per night price"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 font-medium">Max Guests *</label>
                  <input
                    type="number"
                    name="maxGuests"
                    defaultValue={editingStay?.maxGuests || ''}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    min="1"
                    placeholder="Maximum guests"
                  />
                </div>



                {/* **ENHANCED: Better styling for checkboxes with descriptions** */}
                <div className="mb-4 md:col-span-2">
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="space-y-3">
                      <label className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          name="meals"
                          onChange={(e) => {
                            setEditingStay((prev) => ({
                              ...prev,
                              meals: e.target.checked,
                            }));
                          }}
                          value={editingStay?.meals ? 'true' : 'false'}
                          defaultChecked={editingStay?.meals || false}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
                        />
                        <div className="ml-3">
                          <span className="text-gray-700 font-medium">Enable Meals</span>
                          <p className="text-xs text-gray-500">Allow guests to add meals to their booking</p>
                        </div>
                      </label>
                      {editingStay?.meals && <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                        <div className="mb-4">
                          <label className="block text-gray-700 mb-2 font-medium">Breakfast Price (₹)</label>
                          <input
                            type="number"
                            name="breakfastPrice"
                            defaultValue={editingStay?.breakfastPrice || ''}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="0"
                            placeholder="0"
                          />
                        </div>

                        <div className="mb-4">
                          <label className="block text-gray-700 mb-2 font-medium">Lunch Price (₹)</label>
                          <input
                            type="number"
                            name="lunchPrice"
                            defaultValue={editingStay?.lunchPrice || ''}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="0"
                            placeholder="0"
                          />
                        </div>

                        <div className="mb-4">
                          <label className="block text-gray-700 mb-2 font-medium">Dinner Price (₹)</label>
                          <input
                            type="number"
                            name="dinnerPrice"
                            defaultValue={editingStay?.dinnerPrice || ''}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="0"
                            placeholder="0"
                          />
                        </div>
                      </div>}
                    </div>
                  </div>
                </div>

                <div className="mb-4 md:col-span-2">
                  <label className="block text-gray-700 mb-2 font-medium">Description</label>
                  <textarea
                    name="description"
                    defaultValue={editingStay?.description || ''}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Describe the stay..."
                  />
                </div>

                <div className="mb-4 md:col-span-2">
                  <label className="block text-gray-700 mb-2 font-medium">Amenities</label>
                  <input
                    type="text"
                    name="amenities"
                    defaultValue={editingStay?.amenities?.join(', ') || ''}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="WiFi, Pool, AC, Parking (comma separated)"
                  />
                </div>

                <div className="mb-4 md:col-span-2">
                  <label className="block text-gray-700 mb-2 font-medium">Special Notes</label>
                  <textarea
                    name="specialNotes"
                    defaultValue={editingStay?.specialNotes || ''}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="2"
                    placeholder="Any special notes or instructions..."
                  />
                </div>

                <div className="mb-4 md:col-span-2">
                  <label className="block text-gray-700 mb-2 font-medium">Images</label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {imagePreviews.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={img}
                          alt={`Preview ${index}`}
                          className="w-24 h-24 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(
                            index,
                            editingStay && img.startsWith('http')
                          )}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <FiX size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <label className="flex flex-col items-center justify-center px-6 py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-100">
                    <FiUpload className="text-gray-400 text-3xl mb-2" />
                    <span className="text-gray-600 font-medium">Upload Images</span>
                    <span className="text-gray-400 text-sm mt-1">Click to select files</span>
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

              <div className="flex justify-end space-x-3 mt-6 p-4 border-t bg-gray-50">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingStay ? 'Update Stay' : 'Create Stay'}
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
