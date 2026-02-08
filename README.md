# Full-Stack Task Manager

A modern, high-performance task management application built with a focus on reactivity, clean architecture, and a "Strawberry" aesthetic. This monorepo contains a fully decoupled Angular frontend and a Node.js/Express backend.

## 🚀 Live Demo
- **Frontend:** [https://task-manager-ts-app.vercel.app/](https://task-manager-ts-app.vercel.app/)
- **Backend API:** [https://task-manager-ts-app-production.up.railway.app/](https://task-manager-ts-app-production.up.railway.app/)

---

## 🛠 Tech Stack

### Frontend (Client)
- **Framework:** Angular 18+ (utilizing **Signals** for reactive state)
- **Styling:** SCSS with CSS Variables for Light/Dark mode
- **Icons:** Lucide-Angular
- **Deployment:** Vercel

### Backend (Server)
- **Runtime:** Node.js with Express & TypeScript
- **Database:** MongoDB Atlas (via Mongoose)
- **Authentication:** JWT (JSON Web Tokens) with secure authorization headers
- **Deployment:** Railway

---

## 🏗 Project Structure

```text
.
├── task-manager-client/    # Angular Frontend
│   ├── src/app/            # Components, Services, and Signals
│   └── environments/       # Dev/Prod configuration
├── task-manager-server/    # Node.js Backend
│   ├── src/models/         # Mongoose Schemas
│   ├── src/routes/         # API Endpoints
│   └── src/middleware/     # Auth & Error handling
└── README.md
```

## ✨ Key Features
- **Reactive UI:** Leverages Angular Signals for instant UI updates without unnecessary re-renders.
- **Full Authentication:** Secure Sign-up/Login flow with persistence.
- **Theme Engine:** Seamless Light/Dark mode toggle with persistence.
- **Responsive Navigation:** Optimized sidebar navigation for Desktop, Tablet, and Mobile.
- **Cloud-Native:** Built to scale using MongoDB Atlas and automated CI/CD pipelines.

## 💻 Local Development

1. **Clone the Repo:**
   ```bash
   git clone [your-repo-url]
   ```

2. **Setup Backend:**

        Navigate to /task-manager-server
        Create a .env file with MONGO_URI, JWT_SECRET, and PORT=5000
        Run npm install then npm run dev

3. **Setup Frontend:**

        Navigate to /task-manager-client
        Run npm install then ng serve
        Access at http://localhost:4200


## 📝 Future Roadmap
- [ ] Unit & Integration testing (Jest/Cypress)
- [ ] Task categories and color-coding
- [ ] Drag-and-drop task reordering
- [ ] Push notifications for task deadlines