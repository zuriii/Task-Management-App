## Task Management App

A simple Task Management API built with Node.js, Express, and MongoDB. Users can register, login, and manage tasks with JWT authentication. Each user can create, view, update, and delete their own tasks, with support for pagination and proper error handling.

## Built With

This project is built using the following key technologies:

- [Node JS](https://nodejs.org/docs/latest/api/)
- [Express JS](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/docs/manual/)

## Getting Started

Follow these instructions to run project locally.

### Prerequisites

Follow these commands to run project successfully.

- npm

  ```sh
  npm install npm@latest -g
  ```

  - or install yarn

### Installation

1. Clone the repo

   ```sh
   git clone https://github.com/zuriii/Task-Management-App.git
   ```

2. Install packages in root directory

   ```sh
   npm install
   ```

3. Start the project

   ```sh
   node server.js
   ```

4. All done 😃

<!-- USAGE  -->

## Usage

For additional usage read docs.

## Folder/File Structure Conventions

.env: Stores project configuration variables.

package.json: Lists npm packages and manages project dependencies.

.gitignore: Specifies files and directories to be ignored by Git.

controllers/: Includes all controllers related to handling routes, encapsulating logic for authentication, users, and tasks.

models/: Contains database models (User, Task) defining schema and data behavior.

routes/: Defines application routes for users and tasks.

utils/: Utility functions (error handling, async wrapper, custom IDs, response handling).

enums/: Holds project enums (e.g., response codes).

app.js: Initializes and configures the Express application.

server.js: Entry point for starting the server.

**Use short capitalized names for all JavaScript file, while all other files and folders name should be in lowercase.**

## A typical layout

task-management-api/
│
├── controllers/
│ ├── auth-controller.js
│ ├── task-controller.js
│ └── user-controller.js
│
├── models/
│ ├── task.js
│ └── user.js
│
├── routes/
│ ├── task-routes.js
│ └── user-routes.js
│
├── utils/
│ ├── catchAsync.js
│ ├── appError.js
│ ├── response-handler.js
│ └── custom-id.js
│
├── enums/
│ └── response-codes.js
│
├── app.js
├── server.js
└── .env
