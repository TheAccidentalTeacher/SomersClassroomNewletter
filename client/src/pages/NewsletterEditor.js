import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNewsletter } from '../contexts/NewsletterContext';

const NewsletterEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentNewsletter, loading, error, getNewsletter, createNewsletter, updateNewsletter } = useNewsletter();

  const [newsletter, setNewsletter] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      getNewsletter(id);
    } else {
      setNewsletter({
        title: 'New Newsletter',
        content: { text: '' },
        status: 'draft'
      });
    }
  }, [id, getNewsletter]);

  useEffect(() => {
    if (id && currentNewsletter && !newsletter) {
      setNewsletter(currentNewsletter);
    }
  }, [id, currentNewsletter, newsletter]);

  const saveNewsletter = async () => {
    if (!newsletter || saving) return;
    
    try {
      setSaving(true);
      if (id) {
        await updateNewsletter(id, newsletter);
      } else {
        const created = await createNewsletter(newsletter);
        if (created) {
          navigate(`/editor/${created.id}`, { replace: true });
        }
      }
    } catch (err) {
      console.error('Error saving newsletter:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !newsletter) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>;
  }

  if (!newsletter) {
    return <div className="p-8">Loading newsletter...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Dashboard
            </button>
            
            <h1 className="text-xl font-semibold">
              Newsletter Editor
            </h1>
            
            <button
              onClick={saveNewsletter}
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Newsletter Title
            </label>
            <input
              type="text"
              value={newsletter.title || ''}
              onChange={(e) => setNewsletter({...newsletter, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter newsletter title..."
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              rows={10}
              value={newsletter.content?.text || ''}
              onChange={(e) => setNewsletter({
                ...newsletter, 
                content: {...newsletter.content, text: e.target.value}
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write your newsletter content here..."
            />
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">📧 Preview</h3>
            <div className="bg-white p-4 rounded border">
              <h2 className="text-xl font-bold mb-4 text-blue-600">
                {newsletter.title || 'Newsletter Title'}
              </h2>
              <div className="whitespace-pre-wrap">
                {newsletter.content?.text || 'Your newsletter content will appear here...'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterEditor;