import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDatabase, FiPlay, FiBarChart2, FiLock } from 'react-icons/fi';

const DatabaseConnector = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [result, setResult] = useState(null);

    const handleRunQuery = () => {
        if (!query.trim()) return;
        setIsExecuting(true);
        setResult(null);

        // Mock Text2SQL backend execution
        setTimeout(() => {
            setResult({
                sql: "SELECT region, SUM(amount) as total_sales FROM sales GROUP BY region ORDER BY total_sales DESC;",
                data: [
                    { region: 'North America', total_sales: '$450,000' },
                    { region: 'Europe', total_sales: '$320,000' },
                    { region: 'Asia Pacific', total_sales: '$280,000' }
                ]
            });
            setIsExecuting(false);
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
                <motion.div 
                    initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
                    className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-5xl flex flex-col overflow-hidden shadow-2xl"
                >
                    <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gray-900">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FiDatabase className="text-blue-500" /> Enterprise Text2SQL Analyst
                        </h2>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors">
                            <FiX size={24} />
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row min-h-[500px]">
                        {/* Input Panel */}
                        <div className="w-full md:w-1/3 border-r border-white/10 bg-gray-800 p-6 flex flex-col gap-4">
                            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg text-sm flex items-center gap-2">
                                <FiLock /> Connected to: Production_DB (Read-Only)
                            </div>
                            
                            <label className="text-gray-400 font-medium">Ask a question about your data:</label>
                            <textarea 
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="e.g. What were the total sales by region last quarter?"
                                className="w-full h-32 bg-gray-900 text-white rounded-xl p-4 outline-none border border-white/10 focus:border-blue-500 resize-none"
                            />
                            
                            <button 
                                onClick={handleRunQuery}
                                disabled={isExecuting || !query.trim()}
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                            >
                                {isExecuting ? 'Analyzing Schema...' : <><FiPlay /> Generate & Execute SQL</>}
                            </button>
                        </div>

                        {/* Results Panel */}
                        <div className="flex-1 bg-gray-950 p-6 flex flex-col">
                            {isExecuting ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                                    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                                    <p>Translating natural language to secure SQL...</p>
                                </div>
                            ) : result ? (
                                <div className="flex flex-col h-full gap-4">
                                    <div className="bg-gray-900 border border-white/10 p-4 rounded-xl">
                                        <h3 className="text-sm text-gray-400 mb-2">Generated SQL Query</h3>
                                        <pre className="text-green-400 font-mono text-sm overflow-x-auto">{result.sql}</pre>
                                    </div>
                                    
                                    <div className="flex-1 bg-gray-900 border border-white/10 p-4 rounded-xl overflow-y-auto">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm text-gray-400">Results Table</h3>
                                            <button className="text-blue-400 flex items-center gap-1 text-sm"><FiBarChart2 /> View Chart</button>
                                        </div>
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-white/10 text-gray-400">
                                                    <th className="pb-2">Region</th>
                                                    <th className="pb-2">Total Sales</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {result.data.map((row, i) => (
                                                    <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                                                        <td className="py-3 text-white">{row.region}</td>
                                                        <td className="py-3 text-white">{row.total_sales}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
                                    <FiDatabase size={64} className="mb-4 opacity-50" />
                                    <p>Ask a natural language question.</p>
                                    <p className="text-sm text-gray-500 mt-2">I will generate SQL and query the DB autonomously.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default DatabaseConnector;
