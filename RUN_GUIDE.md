# How to Run the Lead Tracking App

Follow these simple steps to run the project on your computer:

### Step 1: Open Terminal
Open your terminal (or Command Prompt / PowerShell) and go to the project folder.

### Step 2: Install Backend Dependencies
Open the `backend` folder and install packages:
```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies
Go to the `frontend` folder and install packages:
```bash
cd ../frontend
npm install
```

### Step 4: Run the Backend Server
Go back to the `backend` folder and start the server:
```bash
cd ../backend
npm run dev
```
*(The API will start running on http://localhost:5000)*

### Step 5: Run the Frontend (React App)
Open a **new separate terminal window**, go to the `frontend` folder, and start the React app:
```bash
cd frontend
npm run dev
```
*(The Website will start running on http://localhost:5173)*

### Step 6: Test the App!
Open your browser and go to **http://localhost:5173** to use the application.

---

### (Optional) Add Dummy Data
If you want to add some dummy leads for testing, run this command inside the `backend` folder:
```bash
npm run seed
```
