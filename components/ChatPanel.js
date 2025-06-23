import { Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function ChatPanel({ onClose }) {
    const [messages, setMessages] = useState([
        { from: 'bot', text: '¡Hola! Soy tu asistente. ¿En qué puedo ayudarte hoy?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const panelRef = useRef();
    const messagesEndRef = useRef();

    useEffect(() => {
        // scroll to bottom when new message arrives
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Close panel on outside click or ESC key
    useEffect(() => {
        function handleKey(e) {
            if (e.key === 'Escape') onClose();
        }
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    const handleSend = async () => {
        const text = inputValue.trim();
        if (!text) return;

        // Add user message to chat
        setMessages(prev => [...prev, { from: 'user', text }]);
        setInputValue('');

        // Add thinking indicator
        setMessages(prev => [...prev, { from: 'bot', text: '🤔 Pensando...', isThinking: true }]);

        try {
            // Call our chat API that integrates with Gemini
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userMessage: text }),
            });

            const data = await response.json();

            if (response.ok) {
                // Remove thinking message and add real response
                setMessages(prev => {
                    const withoutThinking = prev.filter(msg => !msg.isThinking);
                    return [...withoutThinking, { from: 'bot', text: data.message }];
                });

                // If there are search results, optionally show them
                if (data.searchResults && data.searchResults.length > 0) {
                    const resultsText = `\n\n📍 Lugares encontrados:\n${data.searchResults.map(p =>
                        `• ${p.product_name} en ${p.name} - $${p.product_price}`
                    ).join('\n')}`;

                    setMessages(prev => [...prev, { from: 'bot', text: resultsText }]);
                }
            } else {
                // Remove thinking message and show error
                setMessages(prev => {
                    const withoutThinking = prev.filter(msg => !msg.isThinking);
                    return [...withoutThinking, { from: 'bot', text: 'Lo siento, tuve un problema al procesar tu mensaje. ¿Puedes intentar de nuevo?' }];
                });
            }
        } catch (error) {
            console.error('Chat error:', error);
            // Remove thinking message and show error
            setMessages(prev => {
                const withoutThinking = prev.filter(msg => !msg.isThinking);
                return [...withoutThinking, { from: 'bot', text: 'Lo siento, hay un problema de conexión. ¿Puedes intentar más tarde?' }];
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-end">
            <div
                ref={panelRef}
                className="w-80 bg-white h-full shadow-xl flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Chat de recomendaciones</h2>
                    <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-xs p-2 rounded-lg text-sm whitespace-pre-wrap ${msg.from === 'user' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-800'
                                    }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t flex items-center space-x-2">
                    <input
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-orange-500"
                        placeholder="Escribe un mensaje..."
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <button
                        onClick={handleSend}
                        className="text-orange-500 hover:text-orange-600"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
