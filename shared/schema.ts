import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the weather pattern schema
export const weatherPatterns = pgTable("weather_patterns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  region: text("region").notNull(),
  season: text("season").notNull(),
  temperatureTendency: integer("temperature_tendency").notNull(),
  windIntensity: integer("wind_intensity").notNull(),
  specialEventProbability: integer("special_event_probability").notNull(),
  days: integer("days").notNull(),
  weatherData: jsonb("weather_data").notNull(),
  createdAt: text("created_at").notNull(),
});

// Create the insert schema for weather patterns
export const insertWeatherPatternSchema = createInsertSchema(weatherPatterns).omit({
  id: true,
});

export type InsertWeatherPattern = z.infer<typeof insertWeatherPatternSchema>;
export type WeatherPattern = typeof weatherPatterns.$inferSelect;

// Define users schema (from default schema)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
