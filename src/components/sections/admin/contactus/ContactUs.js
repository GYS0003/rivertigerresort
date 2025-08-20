'use client';

import React, { useEffect, useState } from 'react';

const ContactUs = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/contactus');
      const data = await res.json();
      if (res.ok) {
        setContacts(data.messages || []);
      } else {
        console.error(data.error || 'Failed to fetch messages');
      }
    } catch (err) {
      console.error('Error fetching contact messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-emerald-700">
        Contact Messages
      </h1>

      {loading ? (
        <p className="text-gray-600 text-center">Loading messages...</p>
      ) : contacts.length === 0 ? (
        <p className="text-gray-500 text-center">No messages found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map((contact) => (
            <div
              key={contact._id}
              className="bg-white shadow-md rounded-lg p-5 border border-gray-200"
            >
              <div className="mb-2">
                <p className="text-sm text-gray-500">Date: {new Date(contact.createdAt).toLocaleString()}</p>
              </div>

              <h2 className="text-lg font-semibold text-gray-800 mb-1">
                {contact.firstName} {contact.lastName}
              </h2>

              <p className="text-sm text-gray-700 mb-1">
                <strong>Phone:</strong> +91-{contact.phone}
              </p>

              <p className="text-sm text-gray-700 mb-1">
                <strong>Email:</strong> {contact.email}
              </p>

              <p className="text-sm text-gray-700 mt-3">
                <strong>Message:</strong>
                <br />
                <span className="whitespace-pre-line">{contact.message}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactUs;
