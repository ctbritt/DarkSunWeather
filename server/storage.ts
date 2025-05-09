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
  private weatherPatterns: Map<number, WeatherPattern>;
  currentId: number;
  weatherPatternId: number;

  constructor() {
    this.users = new Map();
    this.weatherPatterns = new Map();
    this.currentId = 1;
    this.weatherPatternId = 1;
  }

  // User methods
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

  // Weather pattern methods
  async getAllWeatherPatterns(): Promise<WeatherPattern[]> {
    return Array.from(this.weatherPatterns.values());
  }

  async getWeatherPatternById(id: number): Promise<WeatherPattern | undefined> {
    return this.weatherPatterns.get(id);
  }

  async createWeatherPattern(pattern: Omit<WeatherPattern, 'id'>): Promise<WeatherPattern> {
    const id = this.weatherPatternId++;
    const newPattern = { ...pattern, id } as WeatherPattern;
    this.weatherPatterns.set(id, newPattern);
    return newPattern;
  }

  async updateWeatherPattern(id: number, pattern: Omit<WeatherPattern, 'id'>): Promise<WeatherPattern> {
    const existingPattern = this.weatherPatterns.get(id);
    if (!existingPattern) {
      throw new Error(`Weather pattern with id ${id} not found`);
    }
    
    const updatedPattern = { ...pattern, id } as WeatherPattern;
    this.weatherPatterns.set(id, updatedPattern);
    return updatedPattern;
  }

  async deleteWeatherPattern(id: number): Promise<void> {
    if (!this.weatherPatterns.has(id)) {
      throw new Error(`Weather pattern with id ${id} not found`);
    }
    
    this.weatherPatterns.delete(id);
  }
}

export const storage = new MemStorage();
