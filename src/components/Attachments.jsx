import React, { useState, useEffect } from 'react';
import { Paperclip, Download, Trash2, File } from 'lucide-react';
import AttachmentService from '../lib/attachmentService';
import { useAuth } from '../state/authContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

const Attachments = ({ taskId }) => {
  const { user } = useAuth();
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchAttachments();
  }, [taskId]);

  const fetchAttachments = async () => {
    try {
      setLoading(true);
      const data = await AttachmentService.getForTask(taskId);
      setAttachments(data);
    } catch (error) {
      console.error('Error fetching attachments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    try {
      setUploading(true);
      const attachment = await AttachmentService.upload(taskId, file);
      setAttachments([attachment, ...attachments]);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Max size is 10MB.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleDelete = async (id) => {
    try {
      await AttachmentService.delete(id);
      setAttachments(attachments.filter((a) => a._id !== id));
    } catch (error) {
      console.error('Error deleting attachment:', error);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document'))
      return '📋';
    if (mimeType.includes('sheet') || mimeType.includes('excel'))
      return '📊';
    return <File size={16} />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Paperclip size={18} className="text-slate-600" />
        <h3 className="font-semibold text-gray-900">Attachments</h3>
      </div>

      {/* Upload Area */}
      <label
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFileUpload(file);
        }}
        onDragActive={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        className={`block border-2 border-dashed rounded-lg p-4 cursor-pointer transition ${
          dragActive
            ? 'border-blue-900 bg-blue-50'
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <input
          type="file"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
        <div className="text-center">
          <Paperclip
            size={24}
            className="mx-auto mb-2 text-slate-400"
          />
          <p className="text-sm font-medium text-gray-900">
            {uploading ? 'Uploading...' : 'Drag file here or click to upload'}
          </p>
          <p className="text-xs text-slate-500">Max 10MB</p>
        </div>
      </label>

      {/* Attachments List */}
      {loading ? (
        <div className="text-center py-4 text-slate-500">Loading attachments...</div>
      ) : attachments.length === 0 ? (
        <div className="text-center py-4 text-slate-500">No attachments yet</div>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <Card key={attachment._id} className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-xl">{getFileIcon(attachment.fileType)}</span>
                <div className="flex-1 min-w-0">
                  <a
                    href={attachment.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate block"
                  >
                    {attachment.fileName}
                  </a>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(attachment.fileSize)} • {attachment.userId.name}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={attachment.fileUrl}
                  download={attachment.fileName}
                  className="text-slate-600 hover:text-slate-900"
                  title="Download"
                >
                  <Download size={16} />
                </a>
                {attachment.userId._id === user?._id && (
                  <button
                    onClick={() => handleDelete(attachment._id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Attachments;
