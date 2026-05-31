# NPD Pump Validation Application

A comprehensive web application for managing New Product Development (NPD), VA/VE, and Standardization projects with workflow management and document tracking.

## Features

- **Multi-Module Project Management**: NPD, VA/VE, and Standardization workflows
- **Interactive Flowchart System**: Visual workflow representation using ReactFlow
- **Document Management**: Upload, track, and manage project documents
- **Validation Criteria**: Automated and manual validation checkpoints
- **Developer Testing Console**: Built-in testing framework for development
- **Authentication**: Secure login system with role-based access

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Flowchart**: ReactFlow
- **Build Tool**: Vite
- **Testing**: Jest

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd PumpVlidation
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

### Run Tests

```bash
npm test
```

## Project Structure

```
PumpVlidation/
├── src/
│   ├── components/       # Reusable UI components
│   ├── features/         # Feature-specific components
│   │   ├── auth/        # Authentication
│   │   ├── dashboard/   # Dashboard
│   │   ├── npd/         # NPD workflow
│   │   ├── vave/        # VA/VE workflow
│   │   └── standardization/
│   ├── services/        # Business logic and API services
│   ├── data/            # Mock data and constants
│   ├── devtools/        # Developer testing tools
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── public/              # Static assets
└── dist/                # Production build output
```

## Default Login Credentials

For testing purposes, use these credentials:

- **Username**: `admin`
- **Password**: `admin123`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.

## Contact

For questions or support, please contact the development team.
