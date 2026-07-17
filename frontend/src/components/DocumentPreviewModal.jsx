import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText } from 'lucide-react';

export default function DocumentPreviewModal({ isOpen, onClose, filename, htmlContent, onDownload }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8"
        onClick={onClose}
      >
        <motion.div 
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#202123] w-full max-w-4xl h-full max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#2A2B32]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">{filename}</h3>
                <p className="text-xs text-gray-400">Live Preview</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={onDownload}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium text-sm"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </button>
              <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Document Content Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#111111]">
            <div 
              className="mx-auto bg-white rounded-lg shadow-xl relative"
              style={{
                width: '100%',
                maxWidth: '800px',
                minHeight: '1131px', // A4 aspect ratio approximation (800 x 1.414)
                padding: '5%', // Use percentage padding for responsiveness
                color: '#1f2937',
                fontFamily: "'Inter', sans-serif",
                lineHeight: '1.8',
                boxSizing: 'border-box',
                overflowX: 'hidden'
              }}
            >
              {/* Custom CSS for preview rendering specifically */}
              <style dangerouslySetInnerHTML={{__html: `
                .preview-content { word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; }
                .preview-content h1, .preview-content h2, .preview-content h3 { font-family: 'Merriweather', serif; margin-top: 35px; margin-bottom: 20px; }
                .preview-content h1 { font-size: 36px; font-weight: 900; color: #1e3a8a; text-align: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
                .preview-content h2 { font-size: 26px; font-weight: 700; color: #2563eb; }
                .preview-content h3 { font-size: 20px; font-weight: 600; color: #3b82f6; }
                .preview-content p { margin-bottom: 15px; font-size: 15px; text-align: justify; }
                .preview-content ul { margin-bottom: 15px; padding-left: 10px; font-size: 15px; list-style-type: none; }
                .preview-content ul li { margin-bottom: 10px; position: relative; padding-left: 25px; }
                .preview-content ul li::before { content: '➔'; position: absolute; left: 0; color: #f59e0b; font-weight: bold; font-size: 16px; }
                .preview-content ol { margin-bottom: 15px; padding-left: 25px; font-size: 15px; }
                .preview-content ol li { margin-bottom: 10px; }
                .preview-content img { max-width: 100%; border-radius: 12px; margin: 25px 0; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); }
                .preview-content table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
                .preview-content th, .preview-content td { border: 1px solid #e5e7eb; padding: 14px; text-align: left; font-size: 14px; }
                .preview-content th { background-color: #f3f4f6; font-weight: 700; color: #1f2937; }
                /* Code Blocks */
                .preview-content pre { background: #1e1e1e; color: #d4d4d4; padding: 16px; border-radius: 8px; overflow-x: auto; margin-bottom: 20px; }
                .preview-content code { font-family: 'Fira Code', monospace; font-size: 13px; }
              `}} />
              <div 
                className="preview-content"
                dangerouslySetInnerHTML={{ __html: htmlContent }} 
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
