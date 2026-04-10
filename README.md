# Amazing Cart

Amazing Cart is a Node.js-based web application designed to provide a seamless experience for users to browse, access, and manage educational materials. The project follows a modular architecture, separating concerns into controllers, routes, and views, and leverages Express.js for server-side logic and EJS for templating.

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [File Structure](#file-structure)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [License](#license)

## Project Overview
Amazing Cart is built to serve educational content for various competitive exams (JEE, NEET, UPSC, etc.). It provides user and host management, error handling, and a clean separation between backend logic and frontend presentation.

## Features
- User and host management
- Modular controllers and routes
- Static file serving (CSS, JS, images)
- EJS-based dynamic views
- Error handling

## File Structure
```
Amazing Cart/
│
├── app.js                # Main application entry point
├── package.json          # Project metadata and dependencies
├── .gitignore            # Git ignore rules
│
├── controllers/          # Application logic controllers
│   ├── errors.js         # Error handling logic
│   ├── hostController.js # Host-related logic
│   └── userController.js # User-related logic
│
├── routes/               # Express route definitions
│   ├── hostRouter.js     # Host routes
│   └── userRouter.js     # User routes
│
├── public/               # Static assets
│   ├── auth.json         # Auth-related static data
│   ├── home.css          # Home page styles
│   ├── material.css      # Material page styles
│   ├── images/           # Image assets
│   ├── js/               # Client-side JavaScript
│   │   ├── main.js
│   │   ├── materials.js
│   │   └── ...
│   ├── jee/              # JEE-specific assets
│   ├── neet/             # NEET-specific assets
│   └── upsc/             # UPSC-specific assets
│
├── views/                # EJS templates for rendering pages
│   ├── host/             # Host-related views
│   ├── partial/          # Shared partial templates
│   └── user/             # User-related views
│       ├── 404.ejs
│       ├── about.ejs
│       ├── contactus.ejs
│       ├── index.ejs
│       └── materials.ejs
│
└── ...                   # Other files and folders
```

## Architecture
- **MVC Pattern**: The project uses the Model-View-Controller (MVC) pattern for clear separation of concerns.
  - **Controllers** handle business logic and interact with data sources.
  - **Routes** define URL endpoints and map them to controller actions.
  - **Views** (EJS templates) render dynamic HTML for the client.
- **Static Assets**: Served from the `public/` directory for efficient client-side loading.
- **Error Handling**: Centralized in `controllers/errors.js` for consistent error responses.

## Tech Stack
- **Node.js**: JavaScript runtime for server-side logic
- **Express.js**: Web framework for routing and middleware
- **EJS**: Templating engine for dynamic HTML rendering
- **CSS**: Styling for frontend pages
- **JavaScript**: Client-side interactivity
- **Git**: Version control

## Getting Started
1. **Clone the repository**
   ```sh
   git clone https://github.com/abhicse12/AmazingCart-project.git
   cd AmazingCart-project
   ```
2. **Install dependencies**
   ```sh
   npm install
   ```
3. **Start the application**
   ```sh
   node app.js
   ```
4. **Access the app**
   Open your browser and go to `http://localhost:3000` (or the port specified in your configuration).

## License
This project is licensed under the MIT License.
