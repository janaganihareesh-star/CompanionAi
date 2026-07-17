// Heavy libraries will be dynamically imported only when needed to reduce initial bundle size.

export const extractTextFromFile = async (file, ext) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (ext === 'pdf') {
        const pdfModule = await import('pdfjs-dist');
        const pdfjsLib = pdfModule.default || pdfModule;
        
        const workerUrl = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl.default;
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          
          let lastY;
          let text = '';
          for (let item of content.items) {
             if (lastY !== undefined && lastY !== item.transform[5]) {
               text += '\n'; // Add newline if Y coordinate changes
             }
             text += item.str;
             lastY = item.transform[5];
          }
          fullText += text + '\n\n';
        }
        
        resolve(fullText.trim() || 'No text found in this PDF.');
        return;
      }

      if (ext === 'docx') {
        const mammoth = (await import('mammoth')).default || await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        // Extract raw text but preserve paragraphs via newlines using a custom transform or just use the generated text with \n\n.
        // Mammoth's extractRawText actually just smashes text. convertToHtml preserves paragraphs. Let's convert to HTML and replace </p> with \n.
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const textWithNewlines = result.value
          .replace(/<\/p>/g, '\n\n')
          .replace(/<br\s*\/?>/g, '\n')
          .replace(/<[^>]+>/g, ''); // Strip remaining HTML tags
          
        resolve(textWithNewlines.trim() || 'No text found in this document.');
        return;
      }

      if (['xlsx', 'xls', 'csv'].includes(ext)) {
        const xlsxModule = await import('xlsx');
        const XLSX = xlsxModule.default || xlsxModule;
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        let fullText = '';
        
        workbook.SheetNames.forEach(sheetName => {
          fullText += `--- Sheet: ${sheetName} ---\n`;
          const worksheet = workbook.Sheets[sheetName];
          fullText += XLSX.utils.sheet_to_csv(worksheet) + '\n\n';
        });
        
        resolve(fullText.trim() || 'No data found in this spreadsheet.');
        return;
      }

      if (['txt', 'json', 'md', 'js', 'html', 'css'].includes(ext)) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(file);
        return;
      }

      reject(new Error('Unsupported file extension for text extraction.'));
    } catch (err) {
      console.error('File extraction error:', err);
      reject(err);
    }
  });
};
