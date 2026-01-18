# Angular Example Screenshot

Since we can't run the full Angular app in this environment, here's what the UI looks like based on the component:

## Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│  🚀 QJax 2.0 - Angular/RxJS Example                        │
│  Ordered Async Request Queue with Rate Limiting            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 📋 What This Demonstrates                                   │
│ • Ordered Execution: Requests fire asynchronously but      │
│   respond in order                                          │
│ • Rate Limiting: Max 5 pending requests prevents server    │
│   overload                                                  │
│ • Progress Tracking: Real-time queue monitoring            │
│ • User Feedback: Button disables when queue is full        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 📊 Queue Status                                             │
│ ┌───────────────────────────────────────────────────────┐  │
│ │████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 3/5     │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ Queue Length: 3 / 5    Status: Processing...               │
│ Can Accept: Yes ✓                                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 🎮 Controls                                                 │
│ ┌──────────────────┐ ┌──────────────────┐ ┌────────────┐  │
│ │ ➕ Make Single   │ │ 🔥 Fire 20       │ │ 🗑️ Clear   │  │
│ │    Request       │ │    Requests      │ │    Queue   │  │
│ └──────────────────┘ └──────────────────┘ └────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 📥 Responses (in order)                  Total responses: 5 │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ ① Request 1: Waffles aren't pancakes!                │  │
│ │ ② Request 2: Beep Boop                                │  │
│ │ ③ Request 3: There is no spoon!                       │  │
│ │ ④ Request 4: The cake is a lie!                       │  │
│ │ ⑤ Request 5: Spider monkey madness.                   │  │
│ └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

               Built with Angular 19 + RxJS
```

## Key Features Visible in UI:

1. **Gradient Header** - Purple gradient with white text
2. **Visual Queue Meter** - Color-coded progress bar (green → yellow → red)
3. **Real-time Stats** - Queue length, status, and capacity
4. **Interactive Buttons** - Auto-disable when queue is full
5. **Ordered Responses** - Numbered list with animations
6. **Modern Design** - Card-based layout with shadows and rounded corners

## To See It Live:

```bash
cd angular-example
npm install
npm start
```

Then open http://localhost:4200 in your browser!
