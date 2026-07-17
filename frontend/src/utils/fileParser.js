// Heavy libraries will be dynamically imported only when needed to reduce initial bundle size.

export const extractTextFromFile = async (file, ext) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (ext === 'pdf') {
        const pdfModule = await import('pdfjs-dist');
        const pdfjsLib = pdfModule.default || pdfModule;
        
        // Import the local worker dynamically to guarantee version match
        const workerUrl = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl.default;
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((item) => item.str);
          fullText += strings.join(' ') + '\n';
        }
        
        resolve(fullText.trim() || 'No text found in this PDF.');
        return;
      }

      if (ext === 'docx') {
        const mammoth = (await import('mammoth')).default || await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        resolve(result.value.trim() || 'No text found in this document.');
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
