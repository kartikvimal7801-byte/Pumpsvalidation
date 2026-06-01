import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Download, Trash2, Search, FileText, Lightbulb } from 'lucide-react';
import { Button } from '@/components/common';
import { ideaBankService, IdeaBankFile } from '@/services/ideaBankService';
import { useAuth } from '@/features/auth/contexts/AuthContext';

interface IdeaBankModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IdeaBankModal({ isOpen, onClose }: IdeaBankModalProps) {
  const { user } = useAuth();
  const [files, setFiles] = useState<IdeaBankFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const response = await ideaBankService.getAllFiles();
      if (response.success && response.data) {
        setFiles(response.data);
      }
    } catch (error) {
      console.error('Failed to load idea bank files:', error);
    } finally {
      setLoading(false);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);
    try {
      const fileData = await convertFileToBase64(selectedFile);
      const response = await ideaBankService.uploadFile(
        selectedFile,
        fileData,
        user.username
      );

      if (response.success && response.data) {
        setFiles((prev) => [response.data!, ...prev]);
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById('idea-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        alert('Failed to upload file. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (file: IdeaBankFile) => {
    try {
      // Convert base64 to blob
      const base64Data = file.data.split(',')[1];
      const mimeType = file.data.split(',')[0].split(':')[1].split(';')[0];

      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this idea file?')) return;

    try {
      const response = await ideaBankService.deleteFile(fileId);
      if (response.success) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
      } else {
        alert('Failed to delete file. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">💡 Idea Bank</h2>
                <p className="text-sm text-white text-opacity-90">
                  Repository for VA/VE concepts, cost-saving ideas and future opportunities
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Upload Section */}
          <div className="px-6 py-4 bg-amber-50 border-b border-amber-100">
            <div className="flex items-center gap-3">
              <label
                htmlFor="idea-file-input"
                className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-dashed border-amber-300 rounded-lg cursor-pointer hover:border-amber-400 hover:bg-amber-100 transition-colors"
              >
                <Upload className="w-5 h-5 text-amber-600 mr-2" />
                <span className="text-sm text-amber-900 font-medium">
                  {selectedFile ? selectedFile.name : 'Choose file to upload...'}
                </span>
                <input
                  id="idea-file-input"
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.txt"
                />
              </label>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="flex-shrink-0"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search ideas by file name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-4 h-20" />
                ))}
              </div>
            ) : filteredFiles.length > 0 ? (
              <div className="space-y-3">
                {filteredFiles.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-amber-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      {/* File Icon */}
                      <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-amber-600" />
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {file.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                          <span className="text-gray-300">•</span>
                          <p className="text-xs text-gray-500">
                            Uploaded: {new Date(file.uploadedAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                          <span className="text-gray-300">•</span>
                          <p className="text-xs text-gray-500">By: {file.uploadedBy}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownload(file)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Download file"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete file"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <Lightbulb className="w-10 h-10 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery ? 'No ideas found' : 'No ideas yet'}
                </h3>
                <p className="text-gray-500 text-sm max-w-sm">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : 'Upload your first VA/VE idea, cost-saving concept, or innovation document'}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {filteredFiles.length} {filteredFiles.length === 1 ? 'idea' : 'ideas'}
              {searchQuery && ' found'}
            </p>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
