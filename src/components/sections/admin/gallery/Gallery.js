'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function Gallery() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [showEnabledOnly, setShowEnabledOnly] = useState(false);

    const fileInputRef = useRef(null);

    // Fetch gallery images
    const fetchImages = async () => {
        setLoading(true);
        try {
            const url = showEnabledOnly ? '/api/gallery?enabled=true' : '/api/gallery';
            const res = await fetch(url);
            const data = await res.json();

            if (data.success) {
                setImages(data.data);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            alert('Failed to fetch images');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, [showEnabledOnly]);

    // Handle file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            if (preview) {
                URL.revokeObjectURL(preview);
            }
            setPreview(URL.createObjectURL(file));
        }
    };

    // Clean up blob URL on unmount
    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    // Upload image
    const handleUpload = async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            alert('Please select an image');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const res = await fetch('/api/gallery', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (data.success) {
                alert('Image uploaded successfully!');

                if (fileInputRef.current) {
                    fileInputRef.current.value = null;
                }

                setSelectedFile(null);
                setPreview(null);
                fetchImages();
            } else {
                alert(data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    // Toggle enabled/disabled
    const toggleEnabled = async (id, currentStatus) => {
        try {
            const res = await fetch(`/api/gallery?id=${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ enabled: !currentStatus }),
            });

            const data = await res.json();

            if (data.success) {
                fetchImages();
            } else {
                alert(data.message || 'Failed to update');
            }
        } catch (error) {
            console.error('Toggle error:', error);
            alert('Failed to update image status');
        }
    };

    // Delete image
    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this image?')) {
            return;
        }

        try {
            const res = await fetch(`/api/gallery?id=${id}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (data.success) {
                alert('Image deleted successfully');
                fetchImages();
            } else {
                alert(data.message || 'Delete failed');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete image');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header with inline upload */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Gallery Management
                    </h1>

                    <form onSubmit={handleUpload} className="flex items-center gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        />
                        <button
                            type="submit"
                            disabled={uploading || !selectedFile}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-xs font-medium py-1.5 px-4 rounded-md transition-colors whitespace-nowrap"
                        >
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </form>
                </div>

                {/* Preview */}
                {preview && (
                    <div className="relative w-full max-w-md h-48 mb-6 rounded-lg overflow-hidden shadow-md">
                        <Image
                            src={preview}
                            alt="Preview"
                            fill
                            unoptimized
                            className="object-contain"
                        />
                    </div>
                )}

                {/* Filter */}
                <div className="flex items-center gap-3 mb-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showEnabledOnly}
                            onChange={(e) => setShowEnabledOnly(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                            Show Enabled Only
                        </span>
                    </label>
                </div>

                {/* Gallery Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">Loading...</p>
                    </div>
                ) : images.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">No images found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {images.map((image) => (
                            <div
                                key={image._id}
                                className="bg-white rounded-lg shadow-md overflow-hidden"
                            >
                                <div className="relative h-48 bg-gray-200">
                                    <Image
                                        src={image.imageUrl}
                                        alt="Gallery image"
                                        fill
                                        className="object-cover"
                                    />
                                    {!image.enabled && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <span className="text-white font-semibold">Disabled</span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => toggleEnabled(image._id, image.enabled)}
                                            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                                                image.enabled
                                                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                            }`}
                                        >
                                            {image.enabled ? 'Disable' : 'Enable'}
                                        </button>

                                        <button
                                            onClick={() => handleDelete(image._id)}
                                            className="flex-1 py-2 px-3 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-sm font-medium transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
