'use client';
import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiUpload, FiX, FiSearch, FiImage } from 'react-icons/fi';

const AdventuresAdmin = () => {
    const [adventures, setAdventures] = useState([]);
    const [filteredAdventures, setFilteredAdventures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingAdventure, setEditingAdventure] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [imagePreview, setImagePreview] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [formError, setFormError] = useState('');
    const [selectedFile, setSelectedFile] = useState(null); 
    const fetchAdventures = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/adventure');
            const data = await res.json();
            setAdventures(data);
            setFilteredAdventures(data);
        } catch (error) {
            console.error('Error fetching adventures:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdventures();
    }, []);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredAdventures(adventures);
            return;
        }
        const lc = searchTerm.toLowerCase();
        setFilteredAdventures(
            adventures.filter(
                (a) =>
                    a.name.toLowerCase().includes(lc) ||
                    a.description.toLowerCase().includes(lc)
            )
        );
    }, [searchTerm, adventures]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        /* 1. Build FormData from the real form */
        const form = e.target;
        const fd = new FormData(form);

        /* 2. Basic validation */
        if (
            !fd.get('name')?.trim() ||
            !fd.get('description')?.trim() ||
            !fd.get('pricePerPerson')
        ) {
            setFormError('All fields are required');
            return;
        }

        /* 3. Append id when editing */
        if (editingAdventure) {
            fd.append('id', editingAdventure._id);
            // tell backend to delete old image if user removed it
            if (!imagePreview && editingAdventure.image) {
                fd.append('deleteImage', 'true');
            }
        }

        /* 4. Append the file only when a new file was selected */
        if (selectedFile) {
            fd.append('image', selectedFile); // Ensure correct key
          }

        /* 5. Send */
        try {
            const url = editingAdventure ? `/api/adventure?id=${editingAdventure._id}` : '/api/adventure';
            const res = await fetch(url, {
                method: editingAdventure ? 'PUT' : 'POST',
                body: fd, // DO NOT set Content-Type – let browser do it
            });

            const json = await res.json();
            if (res.ok) {
                fetchAdventures();
                handleCloseModal();
            } else {
                setFormError(json.message || 'Something went wrong');
            }
        } catch (err) {
            console.error(err);
            setFormError('Failed to save adventure');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this adventure?')) return;
        try {
            const res = await fetch(`/api/adventure?id=${id}`, { method: 'DELETE' });
            if (!res.ok) alert((await res.json()).message || 'Failed to delete');
            else fetchAdventures();
        } catch (e) {
            console.error(e);
        }
    };

    const handleEdit = (adv) => {
        setEditingAdventure(adv);
        setImagePreview(adv.image || '');
        setShowModal(true);
    };

    const handleAddNew = () => {
        setEditingAdventure(null);
        setImagePreview('');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingAdventure(null);
        setImagePreview('');
        setFormError('');
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
          setSelectedFile(file);
          setImagePreview(URL.createObjectURL(file));
        }
      };
      


      const removeImage = () => {
        setSelectedFile(null);
        setImagePreview('');
      };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4 md:p-6 xl:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 md:p-5 lg:p-6 mb-4 md:mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Manage Adventures</h1>
                            <p className="text-sm sm:text-base text-gray-600 mt-1">Create and manage adventure experiences</p>
                        </div>
                        <button
                            onClick={handleAddNew}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg flex items-center justify-center text-sm sm:text-base shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                            <FiPlus className="mr-1 sm:mr-2 text-base sm:text-lg" /> Add New Adventure
                        </button>
                    </div>

                    {/* Search */}
                    <div className="mt-4 sm:mt-6">
                        <div className="relative max-w-sm md:max-w-xs">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                <FiSearch className="text-gray-400 text-sm" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search adventures..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-emerald-500"></div>
                    </div>
                ) : filteredAdventures.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-6 text-center">
                        <div className="text-4xl sm:text-5xl mb-3">🏞️</div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800">No adventures found</h3>
                        <p className="text-sm sm:text-base text-gray-600 mt-2">
                            Try adjusting your search or add a new adventure
                        </p>
                        <button
                            onClick={handleAddNew}
                            className="mt-3 sm:mt-4 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-sm sm:text-base"
                        >
                            Add New Adventure
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                        {filteredAdventures.map((adv) => (
                            <div
                                key={adv._id}
                                className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
                            >
                                <div className="h-40 sm:h-48 relative">
                                    {adv.image ? (
                                        <img src={adv.image} alt={adv.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full flex items-center justify-center">
                                            <FiImage className="text-gray-400 text-2xl sm:text-3xl" />
                                        </div>
                                    )}
                                    <div className="absolute top-1.5 right-1.5 bg-white/80 backdrop-blur-sm px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-semibold">
                                        ₹{adv.pricePerPerson}
                                    </div>
                                </div>
                                <div className="p-3 sm:p-4">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="min-w-0">
                                            <h2 className="text-base sm:text-lg font-bold text-gray-800 truncate">{adv.name}</h2>
                                        </div>
                                        <div className="flex space-x-1 sm:space-x-1.5 shrink-0">
                                            <button
                                                onClick={() => handleEdit(adv)}
                                                className="p-1.5 sm:p-2 rounded-full hover:bg-blue-100 text-blue-600"
                                                title="Edit"
                                            >
                                                <FiEdit size={14} className="sm:w-4 sm:h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(adv._id)}
                                                className="p-1.5 sm:p-2 rounded-full hover:bg-red-100 text-red-600"
                                                title="Delete"
                                            >
                                                <FiTrash2 size={14} className="sm:w-4 sm:h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-2">{adv.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-2 sm:p-3 md:p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center border-b p-3 sm:p-4 sticky top-0 bg-white z-10">
                                <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800">
                                    {editingAdventure ? 'Edit Adventure' : 'Add New Adventure'}
                                </h2>
                                <button onClick={handleCloseModal} className="p-1.5 rounded-full hover:bg-gray-100">
                                    <FiX size={20} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-3 sm:p-4 md:p-5 lg:p-6">
                                {formError && (
                                    <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-100 text-red-700 rounded-lg text-sm sm:text-base">
                                        {formError}
                                    </div>
                                )}

                                <div className="space-y-3 sm:space-y-4">
                                    <div>
                                        <label className="block text-sm sm:text-base font-medium mb-1">Adventure Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            defaultValue={editingAdventure?.name || ''}
                                            className="w-full p-2 sm:p-2.5 md:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                            required
                                            placeholder="Forest Trekking"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm sm:text-base font-medium mb-1">Description</label>
                                        <textarea
                                            name="description"
                                            defaultValue={editingAdventure?.description || ''}
                                            className="w-full p-2 sm:p-2.5 md:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                            rows="3"
                                            required
                                            placeholder="Describe the adventure..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <div>
                                            <label className="block text-sm sm:text-base font-medium mb-1">Price per person (₹)</label>
                                            <input
                                                type="number"
                                                name="pricePerPerson"
                                                defaultValue={editingAdventure?.pricePerPerson || ''}
                                                className="w-full p-2 sm:p-2.5 md:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                required
                                                placeholder="1500"
                                            />
                                        </div>

                                    </div>

                                    <div>
                                        <label className="block text-sm sm:text-base font-medium mb-1">Adventure Image</label>
                                        {imagePreview ? (
                                            <div className="relative mb-3 sm:mb-4">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-full h-40 sm:h-48 md:h-52 object-cover rounded-lg border"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={removeImage}
                                                    className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-1"
                                                >
                                                    <FiX size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 sm:p-5 text-center cursor-pointer relative">
                                                <input
                                                    type="file"
                                                    name="image"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="block w-full text-sm text-gray-500
             file:mr-4 file:py-2 file:px-4
             file:rounded-full file:border-0
             file:text-sm file:font-semibold
             file:bg-emerald-50 file:text-emerald-700
             hover:file:bg-emerald-100"
                                                />

                                                <FiUpload className="text-gray-400 text-2xl sm:text-3xl mx-auto mb-2" />
                                                <p className="text-sm sm:text-base font-medium">Upload Image</p>
                                                <p className="text-xs sm:text-sm text-gray-500 mt-1">Click or drag image</p>
                                                <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5 MB</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between gap-2 sm:gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm sm:text-base rounded-lg hover:from-emerald-600 hover:to-teal-700 shadow-md"
                                    >
                                        {editingAdventure ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdventuresAdmin;