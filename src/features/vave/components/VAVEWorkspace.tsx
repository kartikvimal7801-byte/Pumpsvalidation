import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Lock, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { Button, Modal, Input } from '@/components/common';
import { StageProgress, StageData } from '@/types';

interface VAVEWorkspaceProps {
  projectId: string;
  initialProgress?: StageProgress;
  completedAt?: Date; // Project completion date
  isProjectCompleted?: boolean; // Whether entire project is completed
  onProgressUpdate: (progress: StageProgress) => void;
}

const STAGE_NAMES = {
  L1: 'Study',
  L2: 'Feasibility Check',
  L3: 'Validation',
  L4: 'ECR / ECN',
  L5: 'Launch',
};

const initialStageData: StageData = {
  status: 'locked',
  completionPercentage: 0,
  uploadedFiles: [],
};

const createInitialProgress = (): StageProgress => ({
  L1: { ...initialStageData, status: 'in-progress' }, // L1 starts unlocked
  L2: { ...initialStageData },
  L3: { ...initialStageData },
  L4: { ...initialStageData },
  L5: { ...initialStageData },
});

export default function VAVEWorkspace({
  initialProgress,
  completedAt,
  isProjectCompleted = false,
  onProgressUpdate,
}: VAVEWorkspaceProps) {
  const [progress, setProgress] = useState<StageProgress>(
    initialProgress || createInitialProgress()
  );
  const [selectedStage, setSelectedStage] = useState<keyof StageProgress | null>(null);
  const [completionInput, setCompletionInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (initialProgress) {
      setProgress(initialProgress);
    }
  }, [initialProgress]);

  const handleStageClick = (stage: keyof StageProgress) => {
    const stageData = progress[stage];
    // Allow clicking on in-progress or completed stages, but not locked
    if (stageData.status !== 'locked') {
      setSelectedStage(stage);
      setCompletionInput(stageData.completionPercentage.toString());
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
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

  const handleSubmit = async () => {
    if (!selectedStage) return;

    const percentage = parseInt(completionInput) || 0;
    const clampedPercentage = Math.min(100, Math.max(0, percentage));

    const updatedProgress = { ...progress };
    const currentStage = updatedProgress[selectedStage];

    // Add file if selected
    if (selectedFile) {
      try {
        const fileData = await convertFileToBase64(selectedFile);
        currentStage.uploadedFiles.push({
          id: Date.now().toString(),
          name: selectedFile.name,
          size: selectedFile.size,
          uploadedAt: new Date(),
          data: fileData, // Store base64 encoded file
        });
      } catch (error) {
        console.error('Error converting file:', error);
        alert('Failed to upload file. Please try again.');
        return;
      }
    }

    // Update completion percentage
    currentStage.completionPercentage = clampedPercentage;
    currentStage.lastUpdated = new Date();

    // Update status based on completion
    if (clampedPercentage === 100) {
      currentStage.status = 'completed';
      // Capture completion date/time when stage reaches 100%
      if (!currentStage.completedAt) {
        currentStage.completedAt = new Date();
      }
      
      // Unlock next stage
      const stages: (keyof StageProgress)[] = ['L1', 'L2', 'L3', 'L4', 'L5'];
      const currentIndex = stages.indexOf(selectedStage);
      if (currentIndex < stages.length - 1) {
        const nextStage = stages[currentIndex + 1];
        if (updatedProgress[nextStage].status === 'locked') {
          updatedProgress[nextStage].status = 'in-progress';
        }
      }
    } else {
      currentStage.status = 'in-progress';
    }

    setProgress(updatedProgress);
    onProgressUpdate(updatedProgress);
    
    // Close modal and reset
    setSelectedStage(null);
    setCompletionInput('');
    setSelectedFile(null);
  };

  const handleDownloadFile = (file: { name: string; data?: string }) => {
    if (!file.data) {
      console.error('File data not available');
      return;
    }

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

  const handleDeleteFile = (fileId: string) => {
    if (!selectedStage || isProjectCompleted) return;
    
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    const updatedProgress = { ...progress };
    const currentStage = updatedProgress[selectedStage];
    
    // Remove file from the list
    currentStage.uploadedFiles = currentStage.uploadedFiles.filter(f => f.id !== fileId);
    currentStage.lastUpdated = new Date();
    
    setProgress(updatedProgress);
    onProgressUpdate(updatedProgress);
  };

  const handleDownloadAllFiles = (files: any[]) => {
    if (files.length === 0) return;
    
    // Download each file individually
    files.forEach((file) => {
      handleDownloadFile(file);
    });
  };

  const getStageTextColor = (status: StageData['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-900';
      case 'in-progress':
        return 'text-orange-900';
      case 'locked':
        return 'text-gray-600';
    }
  };

  const getStageIcon = (status: StageData['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'in-progress':
        return <AlertCircle className="w-8 h-8 text-orange-600" />;
      case 'locked':
        return <Lock className="w-8 h-8 text-gray-500" />;
    }
  };

  const stages: (keyof StageProgress)[] = ['L1', 'L2', 'L3', 'L4', 'L5'];

  return (
    <div className="space-y-8">
      {/* Stage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stages.map((stage, index) => {
          const stageData = progress[stage];
          const isLocked = stageData.status === 'locked';
          const isCompleted = stageData.status === 'completed';
          const completionPercentage = stageData.completionPercentage;
          
          return (
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={() => handleStageClick(stage)}
              className={`relative rounded-2xl p-6 transition-all duration-300 border-4 overflow-hidden
                ${isLocked ? 'opacity-60 cursor-not-allowed border-gray-500' : isCompleted ? 'cursor-pointer hover:shadow-xl border-green-600' : 'cursor-pointer hover:scale-105 hover:shadow-xl border-orange-600'}
              `}
            >
              {/* Base Background (Empty state) */}
              <div className={`absolute inset-0 ${
                isCompleted ? 'bg-green-100' : isLocked ? 'bg-gray-200' : 'bg-orange-100'
              }`} />
              
              {/* Progressive Fill Background */}
              <div 
                className={`absolute bottom-0 left-0 right-0 transition-all duration-500 ease-out ${
                  isCompleted ? 'bg-green-500' : isLocked ? 'bg-gray-400' : 'bg-orange-500'
                }`}
                style={{
                  height: `${completionPercentage}%`
                }}
              />

              {/* Content Layer */}
              <div className="relative z-10">
                {/* Completed Badge */}
                {isCompleted && (
                  <div className="absolute -top-2 -right-2 bg-white rounded-full px-2 py-1 shadow-md border-2 border-green-600">
                    <span className="text-xs font-bold text-green-600">✓ LOCKED</span>
                  </div>
                )}

                {/* Stage Number */}
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-md mb-3">
                    {getStageIcon(stageData.status)}
                  </div>
                  <h3 className={`text-xl font-bold mb-1 ${
                    isCompleted ? 'text-green-900' : 
                    isLocked ? 'text-gray-700' : 
                    'text-orange-900'
                  }`}>
                    {stage}
                  </h3>
                  <p className={`text-sm font-medium ${
                    isCompleted ? 'text-green-800' : 
                    isLocked ? 'text-gray-600' : 
                    'text-orange-800'
                  }`}>
                    {STAGE_NAMES[stage]}
                  </p>
                </div>

                {/* Progress Info */}
                <div className="bg-white shadow-sm rounded-lg p-3 text-center">
                  <p className={`text-2xl font-bold mb-1 ${
                    isCompleted ? 'text-green-600' : 
                    isLocked ? 'text-gray-600' : 
                    'text-orange-600'
                  }`}>
                    {stageData.completionPercentage}%
                  </p>
                  <p className="text-xs text-gray-700 font-medium">
                    {stageData.status === 'completed' ? 'Completed' : 
                     stageData.status === 'in-progress' ? 'In Progress' : 'Locked'}
                  </p>
                </div>

                {/* File Count */}
                {stageData.uploadedFiles.length > 0 && (
                  <div className="mt-3 text-center">
                    <div className="inline-block bg-white bg-opacity-90 rounded-full px-3 py-1 shadow-sm">
                      <p className={`text-xs font-semibold ${
                        isCompleted ? 'text-green-700' : 
                        isLocked ? 'text-gray-600' : 
                        'text-orange-700'
                      }`}>
                        {stageData.uploadedFiles.length} {stageData.uploadedFiles.length === 1 ? 'file' : 'files'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Review hint for completed stages */}
                {isCompleted && (
                  <div className="mt-3 text-center">
                    <div className="inline-block bg-white bg-opacity-90 rounded-full px-3 py-1 shadow-sm">
                      <p className="text-xs text-green-800 font-semibold">
                        Click to review
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Arrow to next stage */}
              {index < stages.length - 1 && (
                <div className="hidden lg:block absolute -right-8 top-1/2 transform -translate-y-1/2 z-10">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Stage Detail Modal */}
      <Modal
        isOpen={selectedStage !== null}
        onClose={() => {
          setSelectedStage(null);
          setCompletionInput('');
          setSelectedFile(null);
        }}
        title={selectedStage ? `${selectedStage}: ${STAGE_NAMES[selectedStage]}` : ''}
        size="md"
      >
        {selectedStage && (
          <div className="space-y-6">
            {/* Current Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Current Status</p>
              <p className={`text-lg font-bold ${getStageTextColor(progress[selectedStage].status)}`}>
                {progress[selectedStage].completionPercentage}% Complete
              </p>
              {progress[selectedStage].status === 'completed' && (
                <>
                  <p className="text-sm text-green-600 mt-1">✓ This stage is completed and locked for editing</p>
                  {progress[selectedStage].completedAt && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Completion Date & Time:</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(progress[selectedStage].completedAt!).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                        {' '}
                        <span className="text-gray-600">
                          {new Date(progress[selectedStage].completedAt!).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </span>
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Uploaded Files List - Always visible */}
            {progress[selectedStage].uploadedFiles.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {progress[selectedStage].status === 'completed' ? 'Documents' : 'Uploaded Files'}
                </p>
                <div className="space-y-2">
                  {progress[selectedStage].uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 font-medium truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDownloadFile(file)}
                          className="flex-shrink-0 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Download file"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {!isProjectCompleted && progress[selectedStage].status !== 'completed' && (
                          <button
                            onClick={() => handleDeleteFile(file.id)}
                            className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete file"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Show edit controls only if NOT completed */}
            {progress[selectedStage].status !== 'completed' ? (
              <>
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload File
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                      <Upload className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {selectedFile ? selectedFile.name : 'Choose file...'}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </label>
                  </div>
                </div>

                {/* Completion Percentage */}
                <Input
                  label="Completion Percentage (0-100)"
                  type="number"
                  min="0"
                  max="100"
                  value={completionInput}
                  onChange={(e) => setCompletionInput(e.target.value)}
                  placeholder="Enter percentage..."
                />

                {/* Info Message */}
                {parseInt(completionInput) === 100 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      ✓ Completing this stage at 100% will unlock the next stage and lock this stage for editing
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedStage(null);
                      setCompletionInput('');
                      setSelectedFile(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit}>
                    Submit
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Completion Date/Time Display */}
                {completedAt && selectedStage === 'L5' && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-green-900 mb-1">Project Completed!</h4>
                        <p className="text-sm text-green-700 mb-3">
                          All stages have been successfully completed.
                        </p>
                        <div className="bg-white bg-opacity-60 rounded-lg p-3 border border-green-200">
                          <p className="text-xs text-green-600 font-medium mb-1">Completion Date & Time</p>
                          <p className="text-lg font-bold text-green-900">
                            {new Date(completedAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                            {' '}
                            <span className="text-base">
                              {new Date(completedAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                              })}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Read-only message for completed stages */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-900">Stage Completed</p>
                      <p className="text-sm text-blue-700 mt-1">
                        This stage has been marked as complete and is now locked. You can review the documents but cannot make changes.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Review Documents Button */}
                {progress[selectedStage].uploadedFiles.length > 0 && (
                  <div className="pt-4 border-t">
                    <Button
                      className="w-full"
                      onClick={() => handleDownloadAllFiles(progress[selectedStage].uploadedFiles)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download All Documents ({progress[selectedStage].uploadedFiles.length})
                    </Button>
                  </div>
                )}

                {/* Close button for completed stages */}
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedStage(null);
                      setCompletionInput('');
                      setSelectedFile(null);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
