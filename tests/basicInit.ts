import { expect } from "playwright-test-coverage";
import { Page } from "@playwright/test";
import { validUsers } from "./validUsers";

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  roles: Array<{ role: Role }>;
}

enum Role {
  Diner = "diner",
  Franchisee = "franchisee",
  Admin = "admin",
}

export async function basicInit(page: Page) {
  let loggedInUser: User | undefined;

  // Track franchises and stores
  let franchises = [
    {
      id: 1,
      name: "pizzaPocket",
      admins: [{ id: 4, name: "pizza franchisee", email: "f@jwt.com" }],
      stores: [{ id: 1, name: "Test Store", totalRevenue: 0.1 }],
    },
    {
      id: 2,
      name: "LotaPizza",
      admins: [{ id: 5, name: "John Doe", email: "john@jwt.com" }],
      stores: [
        { id: 4, name: "Lehi", totalRevenue: 0 },
        { id: 5, name: "Springville", totalRevenue: 0 },
        { id: 6, name: "American Fork", totalRevenue: 0 },
      ],
    },
    {
      id: 3,
      name: "PizzaCorp",
      admins: [{ id: 6, name: "Jane Smith", email: "jane@jwt.com" }],
      stores: [{ id: 7, name: "Spanish Fork", totalRevenue: 0 }],
    },
    {
      id: 4,
      name: "topSpot",
      admins: [{ id: 7, name: "Bob Johnson", email: "bob@jwt.com" }],
      stores: [],
    },
  ];

  let nextFranchiseId = 5;
  let nextStoreId = 8;
  let nextUserId = 15;

  // See all route requests
//   page.on("request", (r) => {
//     console.log("ALL REQUESTS:", r.method(), r.url());
//   });

  // User registration, login, logout
  await page.route("*/**/api/auth", async (route) => {
    const method = route.request().method();

    if (method === "POST") {
      const registerReq = route.request().postDataJSON();
      const { name, email, password } = registerReq;

      if (!name || !email || !password) {
        await route.fulfill({
          status: 400,
          json: { message: "name, email, and password are required" },
        });
        return;
      }

      // Create new user
      const newUser: User = {
        id: String(nextUserId++),
        name,
        email,
        password,
        roles: [{ role: Role.Diner }],
      };

      // Add to valid users
      validUsers[email] = newUser;
      loggedInUser = newUser;

      const registerRes = {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          roles: newUser.roles,
        },
        token: "abcdef",
      };

      await route.fulfill({ status: 200, json: registerRes });
      return;
    }

    if (method === "PUT") {
      // Login existing user
      const loginReq = route.request().postDataJSON();
      const user = validUsers[loginReq.email];

      if (!user || user.password !== loginReq.password) {
        await route.fulfill({ status: 401, json: { error: "Unauthorized" } });
        return;
      }
      loggedInUser = user;
      const loginRes = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          roles: user.roles,
        },
        token: "abcdef",
      };
      await route.fulfill({ status: 200, json: loginRes });
      return;
    }

    if (method === "DELETE") {
      // Logout
      loggedInUser = undefined;
      await route.fulfill({
        status: 200,
        json: { message: "logout successful" },
      });
      return;
    }

    await route.fulfill({
      status: 405,
      json: { message: "Method not allowed" },
    });
  });

  // Return the currently logged in user
  await page.route("*/**/api/user/me", async (route) => {
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ status: 200, json: loggedInUser });
  });

  // User management routes
  await page.route("*/**/api/user**", async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    // Skip if it's /api/user/me
    if (url.includes("/me")) {
      await route.continue();
      return;
    }

    // GET list users: /api/user?page=0&limit=10&name=*
    if (method === "GET" && url.match(/\/api\/user(\?.*)?$/)) {
      // Only admins can list users
      if (!loggedInUser?.roles.find((r) => r.role === Role.Admin)) {
        await route.fulfill({
          status: 403,
          json: { message: "unauthorized" },
        });
        return;
      }

      // Parse query params
      const urlObj = new URL(url);
      const page = parseInt(urlObj.searchParams.get("page") || "0");
      const limit = parseInt(urlObj.searchParams.get("limit") || "10");
      const nameFilter = urlObj.searchParams.get("name") || "*";

      // Filter users by name
      let users = Object.values(validUsers);
      if (nameFilter !== "*") {
        const filter = nameFilter.replace(/\*/g, "");
        users = users.filter((u) =>
          u.name.toLowerCase().includes(filter.toLowerCase())
        );
      }

      // Paginate
      const start = page * limit;
      const end = start + limit;
      const paginatedUsers = users.slice(start, end + 1);
      const more = paginatedUsers.length > limit;

      const userList = {
        users: paginatedUsers.slice(0, limit).map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          roles: u.roles,
        })),
        more,
      };

      await route.fulfill({ status: 200, json: userList });
      return;
    }

    // DELETE user: /api/user/:userId
    if (method === "DELETE" && url.match(/\/api\/user\/\d+$/)) {
      // Only admins can delete users
      if (!loggedInUser?.roles.find((r) => r.role === Role.Admin)) {
        await route.fulfill({
          status: 403,
          json: { message: "unauthorized" },
        });
        return;
      }

      const userId = url.split("/").pop();

      // Find and remove user
      const userEmail = Object.keys(validUsers).find(
        (email) => validUsers[email].id === userId
      );

      if (userEmail) {
        delete validUsers[userEmail];
      }

      await route.fulfill({ status: 200, json: {} });
      return;
    }

    // PUT update user: /api/user/:userId
    if (method === "PUT" && url.match(/\/api\/user\/\d+$/)) {
      const userId = url.split("/").pop();
      const updateReq = route.request().postDataJSON();

      // Find user
      const userEmail = Object.keys(validUsers).find(
        (email) => validUsers[email].id === userId
      );

      if (!userEmail) {
        await route.fulfill({
          status: 404,
          json: { message: "user not found" },
        });
        return;
      }

      const user = validUsers[userEmail];

      // Only the user themselves or an admin can update
      if (
        loggedInUser?.id !== userId &&
        !loggedInUser?.roles.find((r) => r.role === Role.Admin)
      ) {
        await route.fulfill({
          status: 403,
          json: { message: "unauthorized" },
        });
        return;
      }

      // Update user fields
      if (updateReq.name) user.name = updateReq.name;
      if (updateReq.email) {
        // Update the key in validUsers
        delete validUsers[userEmail];
        validUsers[updateReq.email] = user;
        user.email = updateReq.email;
      }
      if (updateReq.password) user.password = updateReq.password;

      // Update logged in user if it's them
      if (loggedInUser?.id === userId) {
        loggedInUser = user;
      }

      const updateRes = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          roles: user.roles,
        },
        token: "abcdef",
      };

      await route.fulfill({ status: 200, json: updateRes });
      return;
    }

    // If no route matched, continue
    await route.continue();
  });

  // A standard menu
  await page.route("*/**/api/order/menu", async (route) => {
    const menuRes = [
      {
        id: 1,
        title: "Veggie",
        image: "pizza1.png",
        price: 0.0038,
        description: "A garden of delight",
      },
      {
        id: 2,
        title: "Pepperoni",
        image: "pizza2.png",
        price: 0.0042,
        description: "Spicy treat",
      },
    ];
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: menuRes });
  });

  // ALL Franchise routes
  await page.route("*/**/api/franchise**", async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    // POST create franchise: /api/franchise
    if (method === "POST" && url.match(/\/api\/franchise(\?.*)?$/)) {
      const franchiseReq = route.request().postDataJSON();

      const newFranchise = {
        id: nextFranchiseId++,
        name: franchiseReq.name,
        admins: franchiseReq.admins.map((admin: any) => ({
          ...admin,
          id: Math.floor(Math.random() * 1000),
          name: admin.name || "New Admin",
        })),
        stores: [],
      };

      franchises.push(newFranchise);

      await route.fulfill({ status: 200, json: newFranchise });
      return;
    }

    // GET franchise list: /api/franchise
    if (method === "GET" && url.match(/\/api\/franchise(\?.*)?$/)) {
      console.log("GET franchise list, count:", franchises.length);
      const franchiseRes = {
        franchises: franchises,
        more: false,
      };
      await route.fulfill({ json: franchiseRes });
      return;
    }

    // DELETE store: /api/franchise/:franchiseId/store/:storeId
    if (
      method === "DELETE" &&
      url.match(/\/api\/franchise\/(\d+)\/store\/(\d+)$/)
    ) {
      const matches = url.match(/\/api\/franchise\/(\d+)\/store\/(\d+)/);
      const franchiseId = Number(matches![1]);
      const storeId = Number(matches![2]);

      const franchise = franchises.find((f) => f.id === franchiseId);
      if (franchise) {
        franchise.stores = franchise.stores.filter((s) => s.id !== storeId);
      }

      await route.fulfill({ status: 200, json: { message: "store deleted" } });
      return;
    }

    // POST store: /api/franchise/:franchiseId/store
    if (method === "POST" && url.match(/\/api\/franchise\/(\d+)\/store$/)) {
      const matches = url.match(/\/api\/franchise\/(\d+)\/store$/);
      const franchiseId = Number(matches![1]);
      const storeReq = route.request().postDataJSON();

      const franchise = franchises.find((f) => f.id === franchiseId);
      if (franchise) {
        const newStore = {
          id: nextStoreId++,
          name: storeReq.name,
          totalRevenue: 0,
        };
        franchise.stores.push(newStore);
        await route.fulfill({ status: 200, json: newStore });
        return;
      }

      await route.fulfill({
        status: 404,
        json: { message: "franchise not found" },
      });
      return;
    }

    // DELETE franchise: /api/franchise/:franchiseId
    if (method === "DELETE" && url.match(/\/api\/franchise\/\d+/)) {
      const franchiseId = Number(url.split("/").pop());
      franchises = franchises.filter((f) => f.id !== franchiseId);

      await route.fulfill({
        status: 200,
        json: { message: "franchise deleted" },
      });
      return;
    }

    // GET user franchises: /api/franchise/:userId
    if (method === "GET" && url.match(/\/api\/franchise\/\d+$/)) {
      // Return franchises for the user
      const userFranchises = loggedInUser?.roles.find(
        (r) => r.role === Role.Admin
      )
        ? franchises
        : [];

      await route.fulfill({ status: 200, json: userFranchises });
      return;
    }

    // If no other route matched, continue
    await route.continue();
  });

  // Order history and ordering pizza
  await page.route("*/**/api/order", async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    // Skip if menu
    if (url.includes("/menu")) {
      await route.continue();
      return;
    }

    if (method === "GET") {
      // Get order history
      const orderHistoryRes = {
        dinerId: loggedInUser?.id || 0,
        orders: [
          {
            id: 1,
            franchiseId: 1,
            storeId: 1,
            date: "2024-10-10T12:00:00.000Z",
            items: [
              { menuId: 1, description: "Veggie", price: 0.0038 },
              { menuId: 2, description: "Pepperoni", price: 0.0042 },
            ],
          },
        ],
        page: 1,
      };
      await route.fulfill({ status: 200, json: orderHistoryRes });
      return;
    }

    if (method === "POST") {
      // Order a pizza
      const orderReq = route.request().postDataJSON();
      const orderRes = {
        order: { ...orderReq, id: 23 },
        jwt: "eyJpYXQ",
      };
      await route.fulfill({ json: orderRes });
      return;
    }

    await route.fulfill({
      status: 405,
      json: { message: "Method not allowed" },
    });
  });

  await page.goto("/");
}
