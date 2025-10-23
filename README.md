# College Predictor

## Overview
The College Predictor is a chatbot application designed to assist users in predicting suitable colleges based on their preferences and inputs. Users can interact with the chatbot by asking questions and providing mandatory information such as their rank, preferred branch, location, and hostel readiness.

## Features
- User-friendly chatbot interface
- Input fields for mandatory data
- Color-blended, visually appealing layout
- Responsive design for various devices

## Project Structure
```
college-predictor
├── src
│   ├── main.tsx
│   ├── App.tsx
│   ├── pages
│   │   └── Home.tsx
│   ├── components
│   │   ├── Chatbot
│   │   │   ├── Chatbot.tsx
│   │   │   └── ChatMessage.tsx
│   │   ├── InputForm.tsx
│   │   ├── MandatoryFields.tsx
│   │   └── Layout.tsx
│   ├── styles
│   │   ├── globals.css
│   │   └── color-blend.css
│   ├── hooks
│   │   └── useChat.ts
│   ├── utils
│   │   └── validators.ts
│   └── types
│       └── index.ts
├── public
│   └── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd college-predictor
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage
To start the development server, run:
```
npm run dev
```
Open your browser and navigate to `http://localhost:3000` to interact with the College Predictor chatbot.

## Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.