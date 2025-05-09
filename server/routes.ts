import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertWeatherPatternSchema, type WeatherPattern } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for weather patterns
  const apiRouter = app.route('/api');
  
  // Get all weather patterns
  app.get('/api/weather-patterns', async (req, res) => {
    try {
      const patterns = await storage.getAllWeatherPatterns();
      res.json(patterns);
    } catch (error) {
      console.error('Error fetching weather patterns:', error);
      res.status(500).json({ message: 'Failed to fetch weather patterns' });
    }
  });
  
  // Get weather pattern by ID
  app.get('/api/weather-patterns/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }
      
      const pattern = await storage.getWeatherPatternById(id);
      if (!pattern) {
        return res.status(404).json({ message: 'Weather pattern not found' });
      }
      
      res.json(pattern);
    } catch (error) {
      console.error('Error fetching weather pattern:', error);
      res.status(500).json({ message: 'Failed to fetch weather pattern' });
    }
  });
  
  // Create a new weather pattern
  app.post('/api/weather-patterns', async (req, res) => {
    try {
      const validationResult = insertWeatherPatternSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid weather pattern data',
          errors: validationResult.error.errors 
        });
      }
      
      const patternData = validationResult.data;
      const createdPattern = await storage.createWeatherPattern(patternData);
      
      res.status(201).json(createdPattern);
    } catch (error) {
      console.error('Error creating weather pattern:', error);
      res.status(500).json({ message: 'Failed to create weather pattern' });
    }
  });
  
  // Update an existing weather pattern
  app.put('/api/weather-patterns/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }
      
      const existingPattern = await storage.getWeatherPatternById(id);
      if (!existingPattern) {
        return res.status(404).json({ message: 'Weather pattern not found' });
      }
      
      const validationResult = insertWeatherPatternSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid weather pattern data',
          errors: validationResult.error.errors 
        });
      }
      
      const patternData = validationResult.data;
      const updatedPattern = await storage.updateWeatherPattern(id, patternData);
      
      res.json(updatedPattern);
    } catch (error) {
      console.error('Error updating weather pattern:', error);
      res.status(500).json({ message: 'Failed to update weather pattern' });
    }
  });
  
  // Delete a weather pattern
  app.delete('/api/weather-patterns/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }
      
      const existingPattern = await storage.getWeatherPatternById(id);
      if (!existingPattern) {
        return res.status(404).json({ message: 'Weather pattern not found' });
      }
      
      await storage.deleteWeatherPattern(id);
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting weather pattern:', error);
      res.status(500).json({ message: 'Failed to delete weather pattern' });
    }
  });
  
  // Import multiple weather patterns
  app.post('/api/weather-patterns/import', async (req, res) => {
    try {
      const patterns = req.body;
      
      if (!Array.isArray(patterns)) {
        return res.status(400).json({ message: 'Invalid format - expected an array of weather patterns' });
      }
      
      const importedPatterns: WeatherPattern[] = [];
      
      for (const pattern of patterns) {
        const validationResult = insertWeatherPatternSchema.safeParse(pattern);
        
        if (validationResult.success) {
          const createdPattern = await storage.createWeatherPattern(validationResult.data);
          importedPatterns.push(createdPattern);
        }
      }
      
      res.status(201).json({ 
        message: `Successfully imported ${importedPatterns.length} of ${patterns.length} patterns`,
        importedPatterns 
      });
    } catch (error) {
      console.error('Error importing weather patterns:', error);
      res.status(500).json({ message: 'Failed to import weather patterns' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
