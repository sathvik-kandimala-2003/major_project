import React, { useState } from 'react';
import ChatMessage from './ChatMessage';
import InputForm from '../InputForm';

const Chatbot = () => {
    const [messages, setMessages] = useState([]);

    const handleSendMessage = (message) => {
        setMessages([...messages, { text: message, sender: 'user' }]);
        // Here you would typically handle the response from the chatbot
        // For now, we'll just echo the message back
        setMessages((prevMessages) => [
            ...prevMessages,
            { text: `You said: ${message}`, sender: 'bot' },
        ]);
    };

    return (
        <div className="chatbot-container">
            <div className="chat-window">
                {messages.map((msg, index) => (
                    <ChatMessage key={index} message={msg} />
                ))}
            </div>
            <InputForm onSendMessage={handleSendMessage} />
        </div>
    );
};

export default Chatbot;