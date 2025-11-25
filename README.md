# Secure PDF Manager

A private, client-side PDF management tool to rearrange, rotate, merge, and edit documents securely in your browser.

## Features

- 📄 **Upload Multiple PDFs** - Drag and drop or browse to upload
- 🔄 **Rearrange Pages** - Intuitive drag-and-drop interface
- 🔁 **Rotate Pages** - 90° clockwise/counter-clockwise rotation
- 🗑️ **Delete Pages** - Remove unwanted pages
- 🔗 **Merge PDFs** - Combine multiple documents
- 💾 **Export** - Download your edited PDF
- 🔒 **Privacy First** - All processing happens in your browser, no server uploads

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development
- **TailwindCSS** for styling
- **PDF.js** for rendering
- **pdf-lib** for PDF manipulation
- **@dnd-kit** for drag-and-drop

## Getting Started

### Prerequisites

- Node.js 18+ installed

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

### Testing

```bash
npm test
```

## Project Structure

```
src/
├── components/       # Reusable UI components
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── types.ts         # TypeScript type definitions
├── App.tsx          # Main application component
└── index.tsx        # Application entry point
```

## Security & Privacy

- ✅ All file processing happens client-side
- ✅ No files are uploaded to any server
- ✅ No data tracking or analytics
- ✅ Files remain in your browser memory only

## License

MIT
