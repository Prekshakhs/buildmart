const axios = require("axios");

const API = axios.create({
  baseURL: "http://localhost:7777/api",
});

let adminToken, seller1Token, seller2Token, buyerToken, orderId;

async function test() {
  try {
    console.log("\n🧪 TESTING MULTI-SELLER ORDER STATUS FIX\n");

    // 1. Login as admin to check test data
    console.log("1️⃣ Logging in...");
    const adminRes = await API.post("/auth/login", {
      email: "admin@buildmart.com",
      password: "Admin@123456",
    });
    adminToken = adminRes.data.data.token;
    console.log("   ✅ Admin logged in");

    // Set admin token for subsequent requests
    API.defaults.headers.common["Authorization"] = `Bearer ${adminToken}`;

    // 2. Find an order with multiple sellers
    console.log("\n2️⃣ Finding multi-seller order...");
    const ordersRes = await API.get("/orders");
    const multiSellerOrder = ordersRes.data.data.find(
      (order) =>
        order.items &&
        order.items.length > 1 &&
        new Set(order.items.map((i) => i.seller?.toString())).size > 1
    );

    if (!multiSellerOrder) {
      console.log("   ⚠️  No multi-seller order found, creating test scenario...");
      console.log("   📝 Note: Manual test data creation needed in database");
      return;
    }

    orderId = multiSellerOrder._id;
    console.log(`   ✅ Found order: ${orderId}`);
    console.log(`   📦 Items in order:`);
    multiSellerOrder.items.forEach((item, idx) => {
      console.log(
        `      [${idx}] ${item.name} - Seller: ${item.seller} - Status: ${item.status}`
      );
    });

    // 3. Test seller 1 updating their item status
    console.log("\n3️⃣ Testing Seller 1 updating their item status...");

    // Find seller 1's items
    const seller1Items = multiSellerOrder.items
      .map((item, idx) => ({ ...item, index: idx }))
      .filter((_, idx) => idx === 0); // Use first item

    if (seller1Items.length === 0) {
      console.log("   ⚠️  No items found for first seller");
      return;
    }

    const seller1ItemIndex = seller1Items[0].index;
    const seller1Id = seller1Items[0].seller;

    console.log(`   🔄 Updating item at index ${seller1ItemIndex} to "shipped"`);

    // Update seller 1's item to "shipped"
    const updateRes = await API.put(
      `/orders/${orderId}/items/${seller1ItemIndex}/status`,
      { status: "shipped", note: "Test update from seller 1" }
    );

    console.log(`   ✅ Update successful`);

    // 4. Verify the order after update
    console.log("\n4️⃣ Verifying order after update...");
    const verifyRes = await API.get(`/orders/${orderId}`);
    const updatedOrder = verifyRes.data.data;

    console.log(`   📊 Order after update:`);
    updatedOrder.items.forEach((item, idx) => {
      const statusChange =
        idx === seller1ItemIndex
          ? ` ← UPDATED TO SHIPPED`
          : ` (unchanged)`;
      console.log(
        `      [${idx}] ${item.name} - Status: ${item.status}${statusChange}`
      );
    });

    // 5. Verify only the correct item was updated
    console.log("\n5️⃣ Verification Results:");
    let passedTests = 0;
    let totalTests = 0;

    updatedOrder.items.forEach((item, idx) => {
      totalTests++;
      if (idx === seller1ItemIndex) {
        if (item.status === "shipped") {
          console.log(`   ✅ Item [${idx}] correctly updated to "shipped"`);
          passedTests++;
        } else {
          console.log(`   ❌ Item [${idx}] status is "${item.status}", expected "shipped"`);
        }
      } else {
        if (item.status === "pending") {
          console.log(`   ✅ Item [${idx}] correctly remains "pending" (not affected)`);
          passedTests++;
        } else {
          console.log(
            `   ❌ Item [${idx}] status changed to "${item.status}", should remain unchanged!`
          );
        }
      }
    });

    console.log(`\n📈 Test Results: ${passedTests}/${totalTests} passed`);

    if (passedTests === totalTests) {
      console.log("   ✨ MULTI-SELLER FIX IS WORKING CORRECTLY! ✨");
    } else {
      console.log("   ⚠️  Some tests failed - fix may not be complete");
    }
  } catch (error) {
    console.error(
      "❌ Test Error:",
      error.response?.data || error.message
    );
  }
}

test();
