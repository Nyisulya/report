# Field Report AI 🚀

A modern, AI-powered Field Practical Training (IPT) Report Assistant designed with Gemini aesthetic, smart 3-phase report generation, chapter-by-chapter guidance, logbook management, and export to official `.docx` formats.

## 🌟 Key Features
- **Modern Gemini-Inspired UI**: Clean, responsive, glassmorphism sidebar, dark/light theme, and seamless chat experience.
- **Smart 3-Phase Report Generation**:
  - Phase 1: Guided Cover Page & Student Profile Setup.
  - Phase 2: Interactive Chapter-by-Chapter Technical Interview & Elaboration.
  - Phase 3: Automatic Preliminaries Harvester (Abstract, Abbreviations, Table of Contents).
- **Interactive Logbook**: Record, filter, and track weekly activities effortlessly.
- **Academic Export**: Instant export to standardized academic `.docx` reports.
- **Google Authentication**: Built-in Google OAuth 2.0 with both redirect and popup login support.

## 🛠️ Tech Stack
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Lucide Icons
- **Document Generation**: `docx` + `file-saver`
- **Authentication**: Google OAuth 2.0 (`@react-oauth/google` / GIS)

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/Nyisulya/report.git
cd report
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory (or copy from `.env.example`):
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```
The production output will be generated inside the `dist/` directory.

---
Developed with ❤️ for students and technical professionals.
