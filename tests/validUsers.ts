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

export const validUsers: Record<string, User> = {
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

  // Additional 10 users for pagination
  "pizza.diner@jwt.com": {
    id: "4",
    name: "pizza diner",
    email: "pizza.diner@jwt.com",
    password: "diner123",
    roles: [{ role: Role.Diner }],
  },
  "sarah.connor@jwt.com": {
    id: "5",
    name: "Sarah Connor",
    email: "sarah.connor@jwt.com",
    password: "terminator",
    roles: [{ role: Role.Diner }],
  },
  "john.doe@jwt.com": {
    id: "6",
    name: "John Doe",
    email: "john.doe@jwt.com",
    password: "password",
    roles: [{ role: Role.Diner }],
  },
  "amy.smith@jwt.com": {
    id: "7",
    name: "Amy Smith",
    email: "amy.smith@jwt.com",
    password: "pw123",
    roles: [{ role: Role.Diner }],
  },
  "jason.lee@jwt.com": {
    id: "8",
    name: "Jason Lee",
    email: "jason.lee@jwt.com",
    password: "pw123",
    roles: [{ role: Role.Diner }],
  },
  "mia.kim@jwt.com": {
    id: "9",
    name: "Mia Kim",
    email: "mia.kim@jwt.com",
    password: "pw123",
    roles: [{ role: Role.Diner }],
  },
  "alex.tan@jwt.com": {
    id: "10",
    name: "Alex Tan",
    email: "alex.tan@jwt.com",
    password: "pw123",
    roles: [{ role: Role.Diner }],
  },
  "lucas.ng@jwt.com": {
    id: "11",
    name: "Lucas Ng",
    email: "lucas.ng@jwt.com",
    password: "pw123",
    roles: [{ role: Role.Diner }],
  },
  "emily.wu@jwt.com": {
    id: "12",
    name: "Emily Wu",
    email: "emily.wu@jwt.com",
    password: "pw123",
    roles: [{ role: Role.Diner }],
  },
  "robert.fox@jwt.com": {
    id: "13",
    name: "Robert Fox",
    email: "robert.fox@jwt.com",
    password: "pw123",
    roles: [{ role: Role.Diner }],
  },
};
