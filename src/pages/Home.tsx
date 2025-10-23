import React from 'react';
import Layout from '../components/Layout';
import Chatbot from '../components/Chatbot/Chatbot';
import InputForm from '../components/InputForm';

const Home: React.FC = () => {
    return (
        <Layout>
            <h1>College Predictor Chatbot</h1>
            <InputForm />
            <Chatbot />
        </Layout>
    );
};

export default Home;