# QJax jQuery Example

This is the original jQuery example demonstrating qJax v1.x functionality.

## 🚀 Running the Example

Simply open `index.html` in your web browser. No build step required!

```bash
# From the jquery-example directory
open index.html
# or
firefox index.html
# or
chrome index.html
```

## 📋 What This Demonstrates

- **Queue Management**: Ajax requests execute in order, not concurrently
- **Visual Queue Meter**: See the queue fill up and drain
- **Rate Limiting**: Button disables when queue reaches 5 items
- **Mock Ajax**: Uses jquery.mockjax to simulate server responses

## 🎮 How to Use

1. Open `index.html` in your browser
2. Click "Make Random Ajax Request" button
3. Watch the queue meter fill up (changes color as it fills)
4. Keep clicking - button will disable when queue is full
5. Watch responses appear in order as queue processes

## 🏗️ Files

- `index.html` - Main example page
- `jquery-1.9.1.min.js` - jQuery library
- `mockjax/` - Mock Ajax library for testing without a server

## 💡 Code Example

```javascript
var qjax = new $.qjax({
    onQueueChange: function(length) {
        console.log('Queue length:', length);
    },
    ajaxSettings: {
        url: '/api/endpoint'
    }
});

qjax.Queue({
    success: function(data) {
        console.log('Response:', data);
    }
});
```

## 📚 Documentation

See the main [README](../README.markdown) for full jQuery qJax documentation.
