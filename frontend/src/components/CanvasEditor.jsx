import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { motion } from 'framer-motion';
import { Save, FileText, Send, X, Download, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CanvasEditor({ initialContent = '', onSave, onClose }) {
  const [content, setContent] = useState(initialContent);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];

  const handleSave = () => {
    if (onSave) onSave(content);
    toast.success('Document saved to Canvas!');
  };

  const handleDownloadPDF = async () => {
    toast.success('Preparing PDF...');
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.createElement('div');
      element.innerHTML = content;
      const opt = {
        margin:       0.5,
        filename:     'closer-document.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(element).save();
      toast.success('Downloading PDF...');
    } catch (err) {
      toast.error('Failed to generate PDF');
    }
    setShowDownloadMenu(false);
  };

  const handleDownloadDOCX = () => {
    try {
      const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Document</title></head><body>";
      const footer = "</body></html>";
      const sourceHTML = header + content + footer;
      
      const blob = new Blob(['\ufeff', sourceHTML], {
        type: 'application/msword'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'closer-document.doc';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Downloading Word Document...');
    } catch (e) {
      toast.error('Failed to generate Word Document');
    }
    setShowDownloadMenu(false);
  };

  const handleDownloadXLSX = async () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const tables = tempDiv.getElementsByTagName('table');
    if (tables.length === 0) {
      toast.error('No tables found in document to export to Excel.');
      setShowDownloadMenu(false);
      return;
    }
    try {
      toast.success('Preparing Excel...');
      const XLSX = await import('xlsx');
      const wb = XLSX.utils.book_new();
      Array.from(tables).forEach((table, index) => {
        const ws = XLSX.utils.table_to_sheet(table);
        XLSX.utils.book_append_sheet(wb, ws, `Sheet${index + 1}`);
      });
      XLSX.writeFile(wb, 'closer-data.xlsx');
      toast.success('Downloading XLSX...');
    } catch (err) {
      toast.error('Failed to generate Excel file');
    }
    setShowDownloadMenu(false);
  };

  return (
    <motion.div 
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: '50%', opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="h-full bg-bg border-l border-border/40 shadow-2xl flex flex-col z-50 overflow-hidden shrink-0 hidden md:flex"
    >
      <div className="flex items-center justify-between p-4 border-b border-border/40 bg-surface backdrop-blur-md">
        <div className="flex items-center gap-2 text-text font-bold text-lg font-outfit">
          <FileText className="w-5 h-5 text-accent" />
          <span>Closer Canvas</span>
        </div>
        <div className="flex gap-2 items-center relative">
          <div className="relative">
            <button 
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="px-3 py-1.5 bg-surface border border-border hover:bg-white/5 text-text text-sm font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer"
            >
              <Download className="w-4 h-4" /> Export <ChevronDown className="w-4 h-4" />
            </button>
            {showDownloadMenu && (
              <div className="absolute top-full mt-1 right-0 w-40 bg-panel border border-border rounded-xl shadow-xl py-1 z-50">
                <button onClick={handleDownloadPDF} className="w-full text-left px-4 py-2 text-sm hover:bg-surface text-text">PDF (.pdf)</button>
                <button onClick={handleDownloadDOCX} className="w-full text-left px-4 py-2 text-sm hover:bg-surface text-text">Word (.docx)</button>
                <button onClick={handleDownloadXLSX} className="w-full text-left px-4 py-2 text-sm hover:bg-surface text-text">Excel (.xlsx)</button>
              </div>
            )}
          </div>
          <button 
            onClick={handleSave}
            className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 bg-surface border border-border hover:bg-white/5 text-text rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden relative canvas-quill-container">
        <ReactQuill 
          theme="snow" 
          value={content} 
          onChange={setContent} 
          modules={modules}
          formats={formats}
          className="h-full text-text"
          placeholder="Start typing your document, blog, or notes here... The AI can co-edit this with you!"
        />
        <style>{`
          .canvas-quill-container .ql-container {
            height: calc(100% - 42px);
            font-size: 15px;
            font-family: inherit;
            border: none;
          }
          .canvas-quill-container .ql-toolbar {
            border: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(255, 255, 255, 0.05);
          }
          .canvas-quill-container .ql-stroke {
            stroke: #cbd5e1;
          }
          .canvas-quill-container .ql-fill {
            fill: #cbd5e1;
          }
          .canvas-quill-container .ql-picker {
            color: #cbd5e1;
          }
          .canvas-quill-container .ql-editor {
            padding: 24px;
            line-height: 1.6;
          }
        `}</style>
      </div>
      
      {/* Ask AI Mini-bar */}
      <div className="p-3 border-t border-border/40 bg-surface">
        <div className="flex items-center bg-bg border border-white/10 rounded-xl px-3 py-1.5 focus-within:border-accent transition">
          <input 
            type="text" 
            placeholder="Ask AI to expand, summarize, or edit this document..."
            className="flex-1 bg-transparent text-sm text-text outline-none px-2 h-8"
          />
          <button className="p-1.5 bg-accent text-white rounded-lg hover:bg-indigo-600 transition cursor-pointer">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
