import { test, expect } from "playwright-test-coverage";
import { basicInit } from "./basicInit";

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

  // Click login and wait for navigation
  await Promise.all([
    page.waitForResponse(response => 
      response.url().includes('/api/auth') && response.status() === 200
    ),
    page.getByRole("button", { name: "Login" }).click()
  ]);

  // Wait
  await page.waitForTimeout(500);

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