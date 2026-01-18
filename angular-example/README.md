# QJax 2.0 - Angular Example Application

This is a complete, runnable Angular application demonstrating the QJaxService in action.

## ⚠️ Setup Requirements

**This example requires:**
- Node.js 18+ and npm
- Angular CLI installation (~5-10 minutes for first-time setup)
- Building the parent QJax library

**For a simpler demo without any setup, use `demo-standalone.html` in the root directory instead!**

## 🚀 Features Demonstrated

- **Ordered Async Execution**: Fire 20+ async requests that respond in the exact order queued
- **Rate Limiting**: Max 5 pending requests with automatic rejection when full
- **Progress Tracking**: Real-time queue monitoring with visual feedback
- **User Cooldown**: UI automatically disables when queue limit is reached
- **Event Callbacks**: Visual indicators for queue start/stop/error states

## 📋 Prerequisites

- Node.js 18+ and npm
- Angular CLI (will be installed as dev dependency)
- **Time**: First install may take 5-10 minutes

## 🏃 Quick Start

### 1. Install Dependencies

```bash
cd angular-example
npm install
```

**Note:** This will install Angular CLI and all dependencies (~200MB). First install may take several minutes.

### 2. Build the QJax Library

The example imports QJaxService from the parent `src/` directory. Make sure it's built:

```bash
cd ..
npm install
npm run build
cd angular-example
```

### 3. Run the Application

```bash
npm start
```

The app will automatically open in your browser at `http://localhost:4200`

## 🎮 How to Use

1. **Single Request**: Click "Make Single Request" to queue one request
2. **Batch Requests**: Click "Fire 20 Requests" to queue 20 requests simultaneously
3. **Watch the Magic**: See requests execute sequentially and responses appear in order
4. **Queue Full**: Try adding more than 5 requests - the UI will prevent it
5. **Clear Queue**: Click "Clear Queue" to reset

## 🏗️ Project Structure

```
angular-example/
├── src/
│   ├── app/
│   │   └── app.component.ts      # Main component with QJaxService demo
│   ├── index.html                # HTML entry point
│   └── main.ts                   # Bootstrap file
├── angular.json                  # Angular CLI configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
└── README.md                     # This file
```

## 💡 Code Highlights

### Initialize QJaxService

```typescript
this.qjaxService = new QJaxService({
  maxPendingRequests: 5,
  onStart: () => this.status = 'Processing...',
  onStop: () => this.status = 'Idle',
  onQueueChange: (length) => {
    this.queueLength = length;
    this.canMakeRequest = this.qjaxService.canAcceptRequests();
  }
});
```

### Queue Requests

```typescript
this.qjaxService.queue(() => 
  // Can be any Observable - HttpClient, timer, etc.
  this.http.get(`/api/data/${id}`)
).subscribe(data => {
  console.log('Response:', data);
});
```

### Monitor Progress

```typescript
this.qjaxService.queueLength$.subscribe(length => {
  console.log('Queue length:', length);
});
```

## 🔧 Build for Production

```bash
npm run build
```

Output will be in `dist/qjax-angular-example/`

## 📚 Related Documentation

- [QJax Angular/RxJS API Reference](../ANGULAR-README.md)
- [Quick Start Guide](../QUICKSTART.md)
- [Main README](../README.markdown)

## 🐛 Troubleshooting

**Problem**: `Cannot find module '@qjax/...'`
**Solution**: Make sure you've built the parent library with `npm run build` in the root directory

**Problem**: Port 4200 is already in use
**Solution**: Use `ng serve --port 4201` to run on a different port

**Problem**: Module not found errors
**Solution**: Delete `node_modules` and `package-lock.json`, then run `npm install` again

## 📝 Notes

- This is a standalone Angular application (no NgModule)
- Uses Angular 19+ with modern patterns
- Mock HTTP requests with delays to simulate real API calls
- All state management is local to the component
