import { useState } from 'react';

const useChat = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const sendMessage = async (message) => {
        setMessages((prevMessages) => [...prevMessages, { text: message, sender: 'user' }]);
        setLoading(true);

        // Simulate an API call
        const response = await new Promise((resolve) => {
            setTimeout(() => {
                resolve({ text: `Response to: ${message}`, sender: 'bot' });
            }, 1000);
        });

        setMessages((prevMessages) => [...prevMessages, response]);
        setLoading(false);
    };

    return {
        messages,
        loading,
        sendMessage,
    };
};

export default useChat;