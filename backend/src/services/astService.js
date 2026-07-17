const acorn = require('acorn');

/**
 * Parses JavaScript code and returns a simplified Abstract Syntax Tree (AST) representation
 * that highlights functions, classes, and variables to help the AI understand code structure.
 */
exports.analyzeCodeStructure = (code) => {
  try {
    const ast = acorn.parse(code, { ecmaVersion: 2022, sourceType: 'module' });
    const structure = {
      functions: [],
      classes: [],
      variables: [],
      imports: []
    };

    // A simple recursive walker
    const walk = (node) => {
      if (!node) return;

      if (node.type === 'FunctionDeclaration') {
        structure.functions.push(node.id ? node.id.name : 'anonymous');
      } else if (node.type === 'ClassDeclaration') {
        structure.classes.push(node.id ? node.id.name : 'anonymous');
      } else if (node.type === 'VariableDeclarator') {
        if (node.id && node.id.name) {
          structure.variables.push(node.id.name);
        }
      } else if (node.type === 'ImportDeclaration') {
        structure.imports.push(node.source.value);
      }

      for (const key in node) {
        if (node[key] && typeof node[key] === 'object') {
          walk(node[key]);
        }
      }
    };

    walk(ast);
    
    // Deduplicate variables to avoid noise
    structure.variables = [...new Set(structure.variables)].slice(0, 50); // limit to top 50

    return { success: true, structure };
  } catch (error) {
    return { success: false, error: 'AST Parsing failed (Might be invalid JS): ' + error.message };
  }
};
