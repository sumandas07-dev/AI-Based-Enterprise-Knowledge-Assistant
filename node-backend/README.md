node-backend/
│
├── src/
│   │
│   ├── config/
│   │   ├── db.js
│   │   ├── cloudinary.js
│   │   ├── redis.js
│   │   ├── mail.js
│   │   └── env.js
│   │
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Employee.js
│   │   ├── Document.js
│   │   ├── Chat.js
│   │   └── Message.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── employee.controller.js
│   │   ├── document.controller.js
│   │   └── chat.controller.js
│   │
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── employee.service.js
│   │   ├── email.service.js
│   │   ├── document.service.js
│   │   ├── chat.service.js
│   │   └── ai.service.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── employee.routes.js
│   │   ├── document.routes.js
│   │   └── chat.routes.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   ├── upload.middleware.js
│   │   ├── validate.middleware.js
│   │   └── error.middleware.js
│   │
│   ├── utils/
│   │   ├── generatePassword.js
│   │   ├── jwt.js
│   │   ├── hash.js
│   │   └── excel.js
│   │
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── employee.validator.js
│   │   ├── document.validator.js
│   │   └── chat.validator.js
│   │
│   ├── app.js
│   └── server.js
│
├── uploads/
│   └── .gitkeep
│
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md


````
