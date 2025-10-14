import { test, expect } from "playwright-test-coverage";
import { Page } from "@playwright/test";

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

async function basicInit(page: Page) {
  let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = {
    "d@jwt.com": {
      id: "3",
      name: "Kai Chen",
      email: "d@jwt.com",
      password: "a",
      roles: [{ role: Role.Diner }],
    },
    "a@jwt.com": {
      id: "1",
      name: "Admin User",
      email: "a@jwt.com",
      password: "admin",
      roles: [{ role: Role.Admin }],
    },
  };

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

  // See all route requests
  // await page.route("**/*", async (route) => {
  //   const request = route.request();
  //   console.log("ALL REQUESTS:", request.method(), request.url());
  //   await route.continue();
  // });

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
        id: String(Object.keys(validUsers).length + 1),
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
      loggedInUser = validUsers[loginReq.email];
      const loginRes = {
        user: loggedInUser,
        token: "abcdef",
      };
      await route.fulfill({ json: loginRes });
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
    await route.fulfill({ json: loggedInUser });
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

      console.log("DELETE store:", { franchiseId, storeId });

      const franchise = franchises.find((f) => f.id === franchiseId);
      if (franchise) {
        console.log("Before delete:", franchise.stores);
        franchise.stores = franchise.stores.filter((s) => s.id !== storeId);
        console.log("After delete:", franchise.stores);
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
      const userId = url.split("/").pop();

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
    if (url.includes('/menu')) {
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
              { menuId: 2, description: "Pepperoni", price: 0.0042 }
            ]
          }
        ],
        page: 1
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

test("login", async ({ page }) => {
  await basicInit(page);
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("d@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).fill("a");
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByRole("link", { name: "KC" })).toBeVisible();
});

test("purchase with login", async ({ page }) => {
  await basicInit(page);

  // Go to order page
  await page.getByRole("button", { name: "Order now" }).click();

  // Create order
  await expect(page.locator("h2")).toContainText("Awesome is a click away");
  await page.getByRole("combobox").selectOption("4");
  await page.getByRole("link", { name: "Image Description Veggie A" }).click();
  await page.getByRole("link", { name: "Image Description Pepperoni" }).click();
  await expect(page.locator("form")).toContainText("Selected pizzas: 2");
  await page.getByRole("button", { name: "Checkout" }).click();

  // Login
  await page.getByPlaceholder("Email address").click();
  await page.getByPlaceholder("Email address").fill("d@jwt.com");
  await page.getByPlaceholder("Email address").press("Tab");
  await page.getByPlaceholder("Password").fill("a");
  await page.getByRole("button", { name: "Login" }).click();

  // Pay
  await expect(page.getByRole("main")).toContainText(
    "Send me those 2 pizzas right now!"
  );
  await expect(page.locator("tbody")).toContainText("Veggie");
  await expect(page.locator("tbody")).toContainText("Pepperoni");
  await expect(page.locator("tfoot")).toContainText("0.008 ₿");
  await page.getByRole("button", { name: "Pay now" }).click();

  // Check balance
  await expect(page.getByText("0.008")).toBeVisible();
});

test("navigating the footer", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await page
    .getByRole("contentinfo")
    .getByRole("link", { name: "Franchise" })
    .click();
  await expect(page.getByRole("main")).toContainText(
    "So you want a piece of the pie?"
  );
  await expect(page.getByRole("main")).toContainText("Unleash Your Potential");
  await page.getByRole("link", { name: "About" }).click();
  await expect(page.getByRole("main")).toContainText("The secret sauce");
  await expect(page.getByRole("main")).toContainText("Our employees");
  await page.getByRole("link", { name: "History" }).click();
  await expect(page.getByRole("heading")).toContainText("Mama Rucci, my my");
});

test("not found page", async ({ page }) => {
  await page.goto("http://localhost:5173/random-page");
  await expect(page.getByRole("heading")).toContainText("Oops");
});

test("registration and logout", async ({ page }) => {
  await basicInit(page);

  await page.goto("http://localhost:5173/");
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByRole("textbox", { name: "Full name" }).fill("bob");
  await page.getByRole("textbox", { name: "Email address" }).click();
  await page
    .getByRole("textbox", { name: "Email address" })
    .fill("bob@bob.com");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("bob");
  await page.getByRole("button", { name: "Register" }).click();

  await page.waitForURL("**/");

  await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();
  await expect(page.locator("#navbar-dark")).toContainText("Logout");
  await page.getByRole("link", { name: "Logout" }).click();

  await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
  await expect(page.locator("#navbar-dark")).toContainText("Login");
});

test("admin dashboard", async ({ page }) => {
  await basicInit(page);

  await page.goto("http://localhost:5173/");
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("a@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("admin");
  await page.getByRole("button", { name: "Login" }).click();
  await page.getByRole("link", { name: "Admin" }).click();
  await page
    .getByRole("row", { name: "Springville" })
    .getByRole("button")
    .click();

  await page.waitForTimeout(500);
  await expect(page.getByRole("heading")).toContainText("Sorry to see you go");
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "Close" }).click();

  await page.waitForTimeout(500);
  await expect(page.locator("h2")).toContainText("Mama Ricci's kitchen");

  await page
    .getByRole("row", { name: "LotaPizza" })
    .getByRole("button")
    .click();
  await expect(page.getByRole("heading")).toContainText("Sorry to see you go");
  await expect(page.getByRole("main")).toContainText("LotaPizza");
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.locator("h2")).toContainText("Mama Ricci's kitchen");
  await page.getByRole("button", { name: "Add Franchise" }).click();
  await expect(page.getByRole("heading")).toContainText("Create franchise");
  await page.getByRole("textbox", { name: "franchise name" }).click();
  await page
    .getByRole("textbox", { name: "franchise name" })
    .fill("best franchise");
  await page.getByRole("textbox", { name: "franchisee admin email" }).click();
  await page
    .getByRole("textbox", { name: "franchisee admin email" })
    .fill("bestfranchise@franchise.com");
  await page.getByRole("button", { name: "Create" }).click();
});

test("diner dashboard", async ({ page }) => {
  await basicInit(page);

  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'kc' }).click();
  await expect(page.getByRole('heading')).toContainText('Your pizza kitchen');
  await page.waitForTimeout(500);
  await expect(page.getByRole('main')).toContainText('Here is your history of all the good times.');
});

test("docs page", async ({ page }) => {
  await page.goto('http://localhost:5173/docs');
  await expect(page.getByRole('main')).toContainText('JWT Pizza API');
});