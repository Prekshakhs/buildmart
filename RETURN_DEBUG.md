# Return Button Debugging Guide

## Quick Checklist

### 1. Verify the Return Button Shows

```
✓ Go to Orders
✓ Click on an order
✓ Check order status - must be "DELIVERED"
✓ Look for RotateCcw (circular arrow) button next to the price

If button doesn't show:
- Order status is not "delivered"
- Item is cancelled (faded out)
```

### 2. Test Step-by-Step

**Step 1: Open Browser Console**

- Press F12
- Go to Console tab
- Clear any existing messages

**Step 2: Click Return Button**

- You should see messages in console

**Step 3: Fill Form**

- Select a return reason (radio button)
- Type in description
- Watch console for any errors

**Step 4: Click Submit Return**

- Watch console output
- Check for error messages

### 3. Common Issues

**Issue: Button is disabled (grayed out)**

- Solution: Select a reason AND fill description field
- The button should enable when both are filled

**Issue: Nothing happens when clicking**

- Check console F12 for errors
- Look for "Error initiating return:" message
- See what error is shown

**Issue: Loading spinner never stops**

- Check Network tab (F12 > Network)
- Make sure `/api/returns` POST request is being sent
- Check response status (should be 201 or error)

### 4. Console Commands to Test

Copy and paste in browser console:

```javascript
// Check if orderService is available
console.log("orderService:", window.__orderService);

// Test the API directly
fetch("http://localhost:5000/api/returns", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + localStorage.getItem("token"),
  },
  body: JSON.stringify({
    orderId: "test-order-id",
    itemIndex: 0,
    reason: "defective",
    description: "Test return",
  }),
})
  .then((r) => r.json())
  .then((d) => console.log(d));
```

### 5. Verify Backend is Working

**Check Return Routes:**

```bash
# From browser console
fetch('http://localhost:5000/api/health').then(r => r.json()).then(d => console.log(d));
```

**Should return:**

```json
{
  "success": true,
  "message": "Marketplace API is running 🚀"
}
```

### 6. Expected Console Logs

When clicking submit (after fill form), you should see:

```
Form submitted - item: {...}, orderId: "...", reason: "defective", description: "..."
Calling initiateReturn with: {...}
Return initiated successfully: {success: true, data: {...}}
```

---

## If Still Not Working

1. **Share the console error message** (F12 > Console)
2. **Check Network tab** (F12 > Network) - any 400/500 errors?
3. **Verify order status** - Print to console:

   ```javascript
   console.log(order);
   ```

   Check if `status === "delivered"`

4. **Check token** - Is user logged in?
   ```javascript
   console.log("Token:", localStorage.getItem("token"));
   ```
   Should show JWT token, not null

---

## Quick Manual Test

Try this in browser console while on an order detail page:

```javascript
// Get the order data
const orderElement = document.querySelector('[class*="card"]');
console.log("Page loaded successfully");

// Simulate return request
const testReturn = {
  orderId: "order-id-here",
  itemIndex: 0,
  reason: "defective",
  description: "Test return",
};
console.log("Would send:", testReturn);
```

---

**Please run these checks and share:**

1. Console error messages (if any)
2. Order status shown in browser
3. Whether button appears at all
4. Whether button is clickable or grayed out
