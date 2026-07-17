/**
 * AST-inspired Semantic Code Splitter
 * Solves Context Window Exhaustion by extracting only relevant functions/classes
 * from massive codebase files instead of reading the whole 15,000 line file.
 */
class CodeSplitter {
  /**
   * Extremely lightweight semantic chunker.
   * Extracts specific functions or classes based on the target keyword.
   */
  static extractRelevantChunk(fullCode, targetKeyword) {
    if (!targetKeyword || !fullCode) return fullCode;

    console.log(`[Cognitive Breaking] Running Semantic Chunking for keyword: ${targetKeyword}`);
    
    // Split code by functions or classes roughly
    const blocks = fullCode.split(/(?=function|class|const.*?=>|let.*?=>|var.*?=>)/);
    
    const relevantBlocks = blocks.filter(block => 
      block.toLowerCase().includes(targetKeyword.toLowerCase())
    );

    if (relevantBlocks.length > 0) {
      const chunk = relevantBlocks.join('\n\n// ... other code ...\n\n');
      console.log(`[Cognitive Breaking] Extracted chunk of length ${chunk.length} from original length ${fullCode.length}`);
      return chunk;
    }

    // Fallback: If target not found, just return the top 5000 chars to save tokens
    console.warn(`[Cognitive Breaking] Keyword not found. Returning top segment to save Context Window.`);
    return fullCode.substring(0, 5000) + '\n\n// ... file truncated to save tokens ...';
  }
}

module.exports = CodeSplitter;
