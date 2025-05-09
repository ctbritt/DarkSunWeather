import { users, type User, type InsertUser, type WeatherPattern } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Weather pattern methods
  getAllWeatherPatterns(): Promise<WeatherPattern[]>;
  getWeatherPatternById(id: number): Promise<WeatherPattern | undefined>;
  createWeatherPattern(pattern: Omit<WeatherPattern, 'id'>): Promise<WeatherPattern>;
  updateWeatherPattern(id: number, pattern: Omit<WeatherPattern, 'id'>): Promise<WeatherPattern>;
  deleteWeatherPattern(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
