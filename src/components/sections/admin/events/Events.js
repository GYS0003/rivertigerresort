'use client';

import React, { useEffect, useState } from 'react';
import { FiEdit, FiPlus, FiTrash2, FiUpload, FiX } from 'react-icons/fi';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [formError, setFormError] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/event');
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    const res = await fetch(`/api/event?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchEvents();
  };

  const handleEdit = (ev) => {
    setEditingEvent(ev);
    setImagePreview(ev.image);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingEvent(null);
    setImagePreview('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditingEvent(null);
    setSelectedFile(null);
    setImagePreview('');
    setFormError('');
    setShowModal(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const formData = new FormData(e.target);
    if (!formData.get('title') || !formData.get('description') || !formData.get('capacity') || !formData.get('startingPrice')) {
      setFormError('All fields are required');
      return;
    }
    if (editingEvent) {
      formData.append('oldImage', editingEvent.image || '');
    }
    // if (selectedFile) {
    //   formData.append('image', selectedFile);
    // }

    const res = await fetch(`/api/event${editingEvent ? `?id=${editingEvent._id}` : ''}`, {
      method: editingEvent ? 'PUT' : 'POST',
      body: formData,
    });

    if (res.ok) {
      fetchEvents();
      handleCloseModal();
    } else {
      const err = await res.json();
      setFormError(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Manage Events</h1>
          <button onClick={handleAdd} className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">
            <FiPlus className="mr-2" /> Add Event
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((ev) => (
              <div key={ev._id} className="bg-white shadow rounded-lg p-4">
                {ev.image && <img src={ev.image} alt={ev.title} className="w-full h-40 object-cover rounded mb-2" />}
                <h2 className="text-lg font-semibold">{ev.title}</h2>
                <p className="text-sm text-gray-600">{ev.description}</p>
                <p className="text-sm">Capacity: {ev.capacity}</p>
                <p className="text-sm">Starting at ₹{ev.startingPrice}</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleEdit(ev)} className="p-2 bg-blue-100 text-blue-600 rounded-full">
                    <FiEdit />
                  </button>
                  <button onClick={() => handleDelete(ev._id)} className="p-2 bg-red-100 text-red-600 rounded-full">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white w-full max-w-2xl rounded-lg p-6 relative">
              <button onClick={handleCloseModal} className="absolute top-3 right-3 text-gray-500">
                <FiX size={20} />
              </button>
              <h2 className="text-xl font-bold mb-4">{editingEvent ? 'Edit Event' : 'Add Event'}</h2>
              {formError && <div className="mb-2 text-red-600">{formError}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <input name="title" placeholder="Title" defaultValue={editingEvent?.title} className="w-full p-2 border rounded" required />
                <textarea name="description" placeholder="Description" defaultValue={editingEvent?.description} className="w-full p-2 border rounded" required></textarea>
                <input type="number" name="capacity" placeholder="Capacity" defaultValue={editingEvent?.capacity} className="w-full p-2 border rounded" required />
                <input type="number" name="startingPrice" placeholder="Starting Price (₹)" defaultValue={editingEvent?.startingPrice} className="w-full p-2 border rounded" required />

                <div>
                  <label className="block text-sm font-medium">Event Image</label>
                  {imagePreview && (
                    <div className="relative mb-2">
                      <img src={imagePreview} alt="preview" className="w-full h-40 object-cover rounded" />
                      <button type="button" onClick={() => { setSelectedFile(null); setImagePreview(''); }} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1">
                        <FiX size={16} />
                      </button>
                    </div>
                  )}
                  <input type="file" name="image" onChange={handleImageChange} accept="image/*" className="w-full" />
                </div>

                <button type="submit" className="w-full py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
