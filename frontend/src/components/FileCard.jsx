import React, { useState } from 'react';
import { FileText, Download, FileArchive, FileImage, FileCode, CheckCircle2, Loader2, Presentation, FileIcon, Eye } from 'lucide-react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import DocumentPreviewModal from './DocumentPreviewModal';

export default function FileCard({ filename, content, onAutoRefine }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Configure marked with highlight.js
  marked.setOptions({
    highlight: function(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    }
  });

  const getIcon = () => {
    if (!filename) return <FileText className="w-5 h-5" />;
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-400" />;
      case 'docx': 
      case 'doc': return <FileText className="w-5 h-5 text-blue-400" />;
      case 'xlsx':
      case 'xls': return <FileText className="w-5 h-5 text-emerald-400" />;
      case 'pptx':
      case 'ppt': return <Presentation className="w-5 h-5 text-orange-400" />;
      case 'zip': return <FileArchive className="w-5 h-5 text-yellow-400" />;
      case 'png':
      case 'jpg': return <FileImage className="w-5 h-5 text-green-400" />;
      case 'js':
      case 'py':
      case 'html': return <FileCode className="w-5 h-5 text-purple-400" />;
      default: return <FileIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    
    try {
      const ext = filename.split('.').pop().toLowerCase();
      
      if (ext === 'pdf') {
        const html2pdf = (await import('html2pdf.js')).default;
        
        const htmlContent = marked(content);
        
        const container = document.createElement('div');
        container.style.width = '800px'; // Force fixed width to prevent squished multi-column layout
        container.style.padding = '0';
        container.style.margin = '0';
        
        container.innerHTML = `
          <div class="pdf-content">${htmlContent}</div>
        `;
        
        // Add Premium CSS
        const style = document.createElement('style');
        style.innerHTML = `
          @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&family=Inter:wght@400;600;700&display=swap');
          body { font-family: 'Inter', sans-serif; color: #1f2937; line-height: 1.8; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; }
          .pdf-content { padding: 40px; column-count: 1 !important; }
          h1, h2, h3 { font-family: 'Merriweather', serif; margin-top: 35px; margin-bottom: 20px; page-break-after: avoid; }
          h1 { font-size: 36px; font-weight: 900; color: #1e3a8a; text-align: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
          h2 { font-size: 26px; font-weight: 700; color: #2563eb; }
          h3 { font-size: 20px; font-weight: 600; color: #3b82f6; }
          p { margin-bottom: 15px; font-size: 15px; text-align: justify; page-break-inside: avoid; }
          ul { margin-bottom: 15px; padding-left: 10px; font-size: 15px; page-break-inside: avoid; list-style-type: none; }
          ul li { margin-bottom: 10px; position: relative; padding-left: 25px; }
          ul li::before { content: '➔'; position: absolute; left: 0; color: #f59e0b; font-weight: bold; font-size: 16px; }
          ol { margin-bottom: 15px; padding-left: 25px; font-size: 15px; page-break-inside: avoid; }
          ol li { margin-bottom: 10px; }
          img { max-width: 100%; border-radius: 12px; margin: 25px 0; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); page-break-inside: avoid; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 25px; page-break-inside: avoid; }
          th, td { border: 1px solid #e5e7eb; padding: 14px; text-align: left; font-size: 14px; }
          th { background-color: #f3f4f6; font-weight: 700; color: #1f2937; }
        `;
        container.appendChild(style);
        
        // Ensure all images are cross-origin ready for html2canvas
        const images = container.getElementsByTagName('img');
        for (let img of images) {
          img.crossOrigin = 'anonymous';
        }

        const opt = {
          margin:       [10, 10, 20, 10], // top, left, bottom, right
          filename:     filename,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { 
            scale: 2, 
            useCORS: true, 
            letterRendering: true,
            windowWidth: 800,
            width: 800
          },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak:    { mode: ['css', 'legacy'] }
        };

        // Add Page Numbers and Borders
        await html2pdf().from(container).set(opt).toPdf().get('pdf').then((pdf) => {
          const totalPages = pdf.internal.getNumberOfPages();
          for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            
            // Draw Page Border (Thin elegant line)
            pdf.setDrawColor(220, 224, 232);
            pdf.setLineWidth(0.5);
            pdf.rect(10, 10, 190, 277);

            // Footer
            pdf.setFontSize(9);
            pdf.setTextColor(150, 150, 150);
            pdf.text(`Page ${i} of ${totalPages}`, 105, 285, { align: 'center' });
          }
        }).save();
      } else if (ext === 'pptx') {
        const pptxgen = (await import('pptxgenjs')).default;
        let pres = new pptxgen();
        
        // Simple MD parser for PPTX: Split by H1/H2 for slides
        const slides = content.split(/(?=\n#\s|\n##\s)/);
        
        slides.forEach((slideContent, index) => {
          let slide = pres.addSlide();
          let yPos = 0.5;
          
          const lines = slideContent.split('\n');
          lines.forEach(line => {
            if (line.trim() === '') return;
            if (line.startsWith('# ')) {
              slide.addText(line.replace('# ', ''), { x: 0.5, y: yPos, w: '90%', h: 1, fontSize: 24, bold: true, color: '363636' });
              yPos += 1;
            } else if (line.startsWith('## ')) {
              slide.addText(line.replace('## ', ''), { x: 0.5, y: yPos, w: '90%', h: 0.8, fontSize: 20, bold: true, color: '666666' });
              yPos += 0.8;
            } else if (line.startsWith('![')) {
              // Extract image URL
              const match = line.match(/!\[.*?\]\((.*?)\)/);
              if (match && match[1]) {
                try {
                  slide.addImage({ path: match[1], x: 0.5, y: yPos, w: 6, h: 4 });
                  yPos += 4.5;
                } catch(e) {}
              }
            } else {
              slide.addText(line, { x: 0.5, y: yPos, w: '90%', h: 0.5, fontSize: 14, color: '666666' });
              yPos += 0.5;
            }
          });
        });
        
        await pres.writeFile({ fileName: filename });
      } else if (ext === 'docx') {
        // Advanced HTML to DOCX using Blob trick (Word opens HTML)
        const htmlContent = marked(content);
        const docHTML = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Export</title></head><body>${htmlContent}</body></html>`;
        
        const blob = new Blob(['\uFEFF', docHTML], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      } else if (ext === 'xlsx' || ext === 'xls') {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = marked(content);
        const tables = tempDiv.getElementsByTagName('table');
        const wb = XLSX.utils.book_new();
        
        if (tables.length === 0) {
          // If no tables, just write the raw text to a single cell
          const ws = XLSX.utils.aoa_to_sheet([[content]]);
          XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        } else {
          Array.from(tables).forEach((table, index) => {
            const ws = XLSX.utils.table_to_sheet(table);
            XLSX.utils.book_append_sheet(wb, ws, `Sheet${index + 1}`);
          });
        }
        XLSX.writeFile(wb, filename);
      } else {
        // Fallback for standard files (txt, md, js, csv, etc)
        const mimeTypes = {
          'csv': 'text/csv',
          'js': 'text/javascript',
          'json': 'application/json',
          'txt': 'text/plain',
          'md': 'text/markdown'
        };
        const type = mimeTypes[ext] || 'text/plain';
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        let finalFilename = filename;
        if (!finalFilename.includes('.')) {
             finalFilename += '.txt';
        }
        
        a.download = finalFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }

      setIsDownloaded(true);
      toast.success('Document downloaded successfully!');
      setTimeout(() => setIsDownloaded(false), 3000);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to generate document');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="my-3 max-w-sm">
      <div 
        onClick={handleDownload}
        className="flex items-center gap-4 p-3 bg-[#202123] border border-white/10 rounded-xl hover:bg-[#2A2B32] transition-colors cursor-pointer group shadow-lg"
      >
        {/* Icon Container */}
        <div className="w-10 h-10 rounded-lg bg-surface/50 flex items-center justify-center shrink-0">
          {getIcon()}
        </div>
        
        {/* Filename & Info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[14px] text-white truncate group-hover:text-blue-400 transition-colors">
            {filename}
          </div>
          <div className="text-[11px] text-gray-400 font-medium">
            Document • Click to download
          </div>
        </div>
        
        {/* Action Icons */}
        <div className="shrink-0 pl-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowPreview(true); }}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            title="Preview Document"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); handleDownload(); }}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-blue-500/10 transition-colors text-gray-400 hover:text-blue-400"
            title="Download Document"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
            ) : isDownloaded ? (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Auto-Refine Action Buttons */}
      {onAutoRefine && (
        <div className="flex flex-wrap gap-2 pt-3 mt-1 border-t border-white/5">
          <button 
            onClick={() => onAutoRefine('Translate the content to Telugu while keeping the same formatting', filename)}
            className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-md text-xs font-medium transition-colors"
          >
            Translate to Telugu 🇮🇳
          </button>
          <button 
            onClick={() => onAutoRefine('Rewrite the content to be highly professional, formal, and corporate', filename)}
            className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-md text-xs font-medium transition-colors"
          >
            Make Professional 👔
          </button>
          <button 
            onClick={() => onAutoRefine('Summarize the document so it fits nicely on a single concise page', filename)}
            className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-md text-xs font-medium transition-colors"
          >
            Summarize 📝
          </button>
        </div>
      )}

      <DocumentPreviewModal 
        isOpen={showPreview} 
        onClose={() => setShowPreview(false)} 
        filename={filename} 
        htmlContent={marked(content)}
        onDownload={handleDownload}
      />
    </div>
  );
}
