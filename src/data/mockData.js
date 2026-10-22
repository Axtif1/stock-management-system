/**
 * Minimal Box-Based Mock Data for Cold-Drink Warehouse
 * All money, prices, customers, loose bottles, crates, and suppliers have been removed.
 * Unit: BOX everywhere.
 */

export const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Coca-Cola 250ml',
    totalReceived: 10,
    totalGiven: 4,
    remainingBoxes: 6,
  },
  {
    id: 'prod-2',
    name: 'Sprite 250ml',
    totalReceived: 20,
    totalGiven: 7,
    remainingBoxes: 13,
  },
  {
    id: 'prod-3',
    name: 'Thums Up 250ml',
    totalReceived: 15,
    totalGiven: 5,
    remainingBoxes: 10,
  },
  {
    id: 'prod-4',
    name: 'Fanta 250ml',
    totalReceived: 12,
    totalGiven: 4,
    remainingBoxes: 8,
  },
  {
    id: 'prod-5',
    name: 'Pepsi 250ml',
    totalReceived: 18,
    totalGiven: 8,
    remainingBoxes: 10,
  },
  {
    id: 'prod-6',
    name: 'Mountain Dew 250ml',
    totalReceived: 14,
    totalGiven: 6,
    remainingBoxes: 8,
  },
  {
    id: 'prod-7',
    name: 'Sting Energy 250ml',
    totalReceived: 25,
    totalGiven: 15,
    remainingBoxes: 10,
  },
  {
    id: 'prod-8',
    name: 'Red Bull 250ml',
    totalReceived: 8,
    totalGiven: 3,
    remainingBoxes: 5,
  },
  {
    id: 'prod-9',
    name: 'Bisleri 1L',
    totalReceived: 30,
    totalGiven: 12,
    remainingBoxes: 18,
  },
];

export const INITIAL_STOCK_IN = [
  {
    id: 'in-1',
    productId: 'prod-1',
    productName: 'Coca-Cola 250ml',
    boxes: 10,
    timestamp: '2026-10-23T08:30:00Z',
  },
  {
    id: 'in-2',
    productId: 'prod-2',
    productName: 'Sprite 250ml',
    boxes: 20,
    timestamp: '2026-10-23T09:00:00Z',
  },
  {
    id: 'in-3',
    productId: 'prod-7',
    productName: 'Sting Energy 250ml',
    boxes: 25,
    timestamp: '2026-10-23T09:30:00Z',
  },
];

export const INITIAL_STOCK_OUT = [
  {
    id: 'out-1',
    productId: 'prod-1',
    productName: 'Coca-Cola 250ml',
    boxes: 4,
    timestamp: '2026-10-23T10:15:00Z',
  },
  {
    id: 'out-2',
    productId: 'prod-2',
    productName: 'Sprite 250ml',
    boxes: 7,
    timestamp: '2026-10-23T11:00:00Z',
  },
  {
    id: 'out-3',
    productId: 'prod-7',
    productName: 'Sting Energy 250ml',
    boxes: 15,
    timestamp: '2026-10-23T11:45:00Z',
  },
];

export const INITIAL_SETTINGS = {
  warehouseName: 'Om Sai Cold Drinks Depot',
};
