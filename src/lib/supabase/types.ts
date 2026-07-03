export type CustomerAccount = {
  id: string;
  authUserId: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  defaultAddress: string;
  createdAt: string;
  updatedAt: string;
};

export type BackOfficeCustomer = {
  id: string;
  authUserId: string | null;
  name: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  orders: number;
  spent: number;
  average: number;
  lastOrder: string;
  address: string;
  status: "VIP" | "Régulier" | "Nouveau" | "À surveiller";
  topProducts: string[];
};

export type CustomerRegistration = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  address: string;
};

export type CustomerLogin = {
  email: string;
  password: string;
};
