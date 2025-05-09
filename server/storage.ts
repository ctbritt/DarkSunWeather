import { users, weatherPatterns, type User, type InsertUser, type WeatherPattern, type InsertWeatherPattern } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Weather pattern methods
  getAllWeatherPatterns(): Promise<WeatherPattern[]>;
  getWeatherPatternById(id: number): Promise<WeatherPattern | undefined>;
  createWeatherPattern(pattern: InsertWeatherPattern): Promise<WeatherPattern>;
  updateWeatherPattern(id: number, pattern: InsertWeatherPattern): Promise<WeatherPattern>;
  deleteWeatherPattern(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Weather pattern methods
  async getAllWeatherPatterns(): Promise<WeatherPattern[]> {
    return await db.select().from(weatherPatterns);
  }

  async getWeatherPatternById(id: number): Promise<WeatherPattern | undefined> {
    const [pattern] = await db.select().from(weatherPatterns).where(eq(weatherPatterns.id, id));
    return pattern;
  }

  async createWeatherPattern(pattern: InsertWeatherPattern): Promise<WeatherPattern> {
    const [newPattern] = await db
      .insert(weatherPatterns)
      .values(pattern)
      .returning();
    return newPattern;
  }

  async updateWeatherPattern(id: number, pattern: InsertWeatherPattern): Promise<WeatherPattern> {
    const [updatedPattern] = await db
      .update(weatherPatterns)
      .set(pattern)
      .where(eq(weatherPatterns.id, id))
      .returning();
    
    if (!updatedPattern) {
      throw new Error(`Weather pattern with id ${id} not found`);
    }
    
    return updatedPattern;
  }

  async deleteWeatherPattern(id: number): Promise<void> {
    const result = await db
      .delete(weatherPatterns)
      .where(eq(weatherPatterns.id, id));
    
    // Neon doesn't return the number of rows affected, so we can't check if anything was deleted
  }
}

export const storage = new DatabaseStorage();