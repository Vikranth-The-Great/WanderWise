import { geoapifyService } from './geoapify';

interface AttractionData {
  Place: string;
  Attraction: string;
  Travel_Theme: string;
  A_id: string;
  Opening_Time: string;
  Closing_Time: string;
  Rating: string;
  Rating_Count: string;
  Visit_Duration_Minutes: string;
  Latitude: string;
  Longitude: string;
}

interface ProcessedAttraction {
  id: string;
  name: string;
  themes: string[];
  rating: number;
  ratingCount: number;
  duration: number; // in minutes
  openTime: string;
  closeTime: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  score: number; // calculated preference score
}

interface UserPreferences {
  destination: string;
  travelerType: string;
  themes: string[];
  category: string;
}

interface OptimizedDay {
  attractions: ProcessedAttraction[];
  totalTravelTime: number;
  totalDistance: number;
  activities: Array<{
    id: string;
    time: string;
    title: string;
    description: string;
    location: string;
    duration: string;
    cost: string;
    type: string;
    coordinates: { lat: number; lng: number };
    startTime?: Date;
    endTime?: Date;
  }>;
}

interface ScheduleItem {
  attraction: ProcessedAttraction;
  startTime: string;
  endTime: string;
  travelTimeToNext?: number;
}

export class AttractionOptimizer {
  /**
   * Select top attractions based on user preferences and trip duration
   */
  async selectTopAttractions(
    attractions: AttractionData[],
    userPreferences: UserPreferences,
    tripDuration: number
  ): Promise<ProcessedAttraction[]> {
    // Process and score attractions
    const processedAttractions = attractions.map(attraction => 
      this.processAttraction(attraction, userPreferences)
    ).filter(attraction => !isNaN(attraction.rating) && attraction.rating > 0); // Filter out invalid ratings

    // Sort by score (highest first)
    processedAttractions.sort((a, b) => b.score - a.score);

    // Select top attractions (days * 4 to ensure variety)
    const targetCount = Math.min(tripDuration * 4, processedAttractions.length);
    return processedAttractions.slice(0, targetCount);
  }

  /**
   * Process raw attraction data and calculate preference score
   */
  private processAttraction(
    attraction: AttractionData,
    userPreferences: UserPreferences
  ): ProcessedAttraction {
    const rating = parseFloat(attraction.Rating) || 4.0; // Default to 4.0 if no rating
    const ratingCount = parseInt(attraction.Rating_Count) || 100; // Default to 100 if no rating count
    const duration = parseInt(attraction.Visit_Duration_Minutes) || 120;
    const themes = attraction.Travel_Theme ? attraction.Travel_Theme.split(',').map(t => t.trim()) : [];

    // Calculate preference score
    const score = this.calculatePreferenceScore({
      rating,
      ratingCount,
      themes,
      duration
    }, userPreferences);

    return {
      id: attraction.A_id,
      name: attraction.Attraction,
      themes,
      rating,
      ratingCount,
      duration,
      openTime: attraction.Opening_Time || '09:00 AM',
      closeTime: attraction.Closing_Time || '06:00 PM',
      coordinates: {
        lat: parseFloat(attraction.Latitude) || 0,
        lng: parseFloat(attraction.Longitude) || 0
      },
      score
    };
  }

  /**
   * Calculate preference score based on user preferences
   */
  private calculatePreferenceScore(
    attraction: {
      rating: number;
      ratingCount: number;
      themes: string[];
      duration: number;
    },
    userPreferences: UserPreferences
  ): number {
    let score = 0;

    // Base score from rating (0-50 points) - weighted higher for quality
    score += attraction.rating * 12;

    // Popularity bonus based on rating count (0-25 points)
    const popularityScore = Math.min(Math.log10(attraction.ratingCount + 1) * 5, 25);
    score += popularityScore;

    // Enhanced theme matching with weighted scoring (0-40 points)
    let themeScore = 0;
    for (const userTheme of userPreferences.themes) {
      for (const attractionTheme of attraction.themes) {
        const userThemeLower = userTheme.toLowerCase();
        const attractionThemeLower = attractionTheme.toLowerCase();
        
        if (attractionThemeLower.includes(userThemeLower) || userThemeLower.includes(attractionThemeLower)) {
          // Exact or partial match gets full points
          themeScore += 15;
        } else if (this.areRelatedThemes(userThemeLower, attractionThemeLower)) {
          // Related themes get partial points
          themeScore += 8;
        }
      }
    }
    score += Math.min(themeScore, 40);

    // Duration preference based on traveler type (0-15 points)
    const durationScore = this.getDurationScore(attraction.duration, userPreferences.travelerType);
    score += durationScore;

    // Traveler type specific bonuses (0-10 points)
    score += this.getTravelerTypeBonus(attraction, userPreferences.travelerType);

    return score;
  }

  /**
   * Get duration preference score based on traveler type
   */
  private getDurationScore(duration: number, travelerType: string): number {
    switch (travelerType.toLowerCase()) {
      case 'family':
        // Families prefer shorter activities (60-120 minutes)
        if (duration >= 60 && duration <= 120) return 15;
        if (duration <= 180) return 8;
        return 0;
      case 'solo':
        // Solo travelers are flexible (60-180 minutes)
        if (duration >= 60 && duration <= 180) return 15;
        if (duration <= 240) return 8;
        return 0;
      case 'couple':
        // Couples prefer moderate duration (90-150 minutes)
        if (duration >= 90 && duration <= 150) return 15;
        if (duration <= 200) return 8;
        return 0;
      case 'friends':
        // Friends can handle longer activities (120-240 minutes)
        if (duration >= 120 && duration <= 240) return 15;
        if (duration <= 300) return 8;
        return 0;
      default:
        return 8;
    }
  }

  /**
   * Check if two themes are related
   */
  private areRelatedThemes(theme1: string, theme2: string): boolean {
    const relatedThemes: { [key: string]: string[] } = {
      'historical': ['architectural', 'cultural', 'heritage', 'ancient', 'monument'],
      'architectural': ['historical', 'cultural', 'heritage', 'monument', 'building'],
      'cultural': ['historical', 'architectural', 'heritage', 'traditional', 'art'],
      'religious': ['spiritual', 'temple', 'cultural', 'heritage'],
      'natural': ['wildlife', 'scenic', 'outdoor', 'adventure', 'landscape'],
      'adventure': ['outdoor', 'natural', 'sports', 'trekking', 'hiking'],
      'beach': ['coastal', 'water', 'relaxation', 'scenic'],
      'entertainment': ['nightlife', 'shopping', 'leisure', 'fun'],
      'shopping': ['entertainment', 'leisure', 'market', 'commercial']
    };

    return relatedThemes[theme1]?.includes(theme2) || relatedThemes[theme2]?.includes(theme1) || false;
  }

  /**
   * Get traveler type specific bonus
   */
  private getTravelerTypeBonus(attraction: { themes: string[]; rating: number }, travelerType: string): number {
    const themes = attraction.themes.map(t => t.toLowerCase());
    
    switch (travelerType.toLowerCase()) {
      case 'family':
        // Families prefer safe, educational, and fun attractions
        if (themes.some(t => ['cultural', 'educational', 'museum', 'park'].includes(t))) return 10;
        if (themes.some(t => ['adventure', 'nightlife'].includes(t))) return -5;
        return 0;
      case 'couple':
        // Couples prefer romantic, scenic, and cultural attractions
        if (themes.some(t => ['scenic', 'romantic', 'cultural', 'historical'].includes(t))) return 10;
        if (themes.some(t => ['beach', 'sunset', 'garden'].includes(t))) return 8;
        return 0;
      case 'friends':
        // Friends prefer adventure, entertainment, and social activities
        if (themes.some(t => ['adventure', 'entertainment', 'nightlife', 'sports'].includes(t))) return 10;
        if (themes.some(t => ['beach', 'outdoor', 'fun'].includes(t))) return 8;
        return 0;
      case 'solo':
        // Solo travelers prefer flexible, safe, and enriching experiences
        if (themes.some(t => ['cultural', 'historical', 'museum', 'art'].includes(t))) return 10;
        if (attraction.rating >= 4.5) return 5; // High-rated attractions for solo safety
        return 0;
      default:
        return 0;
    }
  }

  /**
   * Optimize attraction arrangement for multiple days
   */
  async optimizeAttractionArrangement(
    selectedAttractions: ProcessedAttraction[],
    tripDuration: number
  ): Promise<OptimizedDay[]> {
    const attractionsPerDay = Math.ceil(selectedAttractions.length / tripDuration);
    const days: OptimizedDay[] = [];

    // Distribute attractions across days
    for (let day = 0; day < tripDuration; day++) {
      const startIndex = day * attractionsPerDay;
      const endIndex = Math.min(startIndex + attractionsPerDay, selectedAttractions.length);
      const dayAttractions = selectedAttractions.slice(startIndex, endIndex);

      // Ensure each day has 3-5 attractions
      const targetCount = Math.max(3, Math.min(5, dayAttractions.length));
      const finalAttractions = dayAttractions.slice(0, targetCount);

      // Optimize the order of attractions for this day
      const optimizedDay = await this.optimizeDayRoute(finalAttractions);
      days.push(optimizedDay);
    }

    return days;
  }

  /**
   * Optimize the route for a single day using nearest neighbor algorithm
   */
  private async optimizeDayRoute(attractions: ProcessedAttraction[]): Promise<OptimizedDay> {
    if (attractions.length <= 1) {
      const activities = this.generateDayActivities(attractions, 0);
      return {
        attractions,
        totalTravelTime: 0,
        totalDistance: 0,
        activities
      };
    }

    // Start with the highest-rated attraction
    const sortedByRating = [...attractions].sort((a, b) => b.rating - a.rating);
    const optimizedRoute: ProcessedAttraction[] = [sortedByRating[0]];
    const remaining = attractions.filter(a => a.id !== sortedByRating[0].id);

    let totalTravelTime = 0;
    let totalDistance = 0;

    // Use nearest neighbor algorithm for the rest
    while (remaining.length > 0) {
      const currentAttraction = optimizedRoute[optimizedRoute.length - 1];
      let nearestIndex = 0;
      let shortestDistance = Infinity;
      let shortestTime = 0;

      // Find the nearest unvisited attraction
      for (let i = 0; i < remaining.length; i++) {
        try {
          const distanceResult = await geoapifyService.calculateDistance(
            currentAttraction.coordinates,
            remaining[i].coordinates,
            'walk'
          );

          if (distanceResult.distance < shortestDistance) {
            shortestDistance = distanceResult.distance;
            shortestTime = distanceResult.duration;
            nearestIndex = i;
          }
        } catch (error) {
          console.error('Error calculating distance:', error);
          // Fallback: use the next attraction in the list
          break;
        }
      }

      // Add the nearest attraction to the route
      const nearestAttraction = remaining.splice(nearestIndex, 1)[0];
      optimizedRoute.push(nearestAttraction);
      totalDistance += shortestDistance;
      totalTravelTime += shortestTime;
    }

    const activities = this.generateDayActivities(optimizedRoute, totalTravelTime);
    
    return {
      attractions: optimizedRoute,
      totalTravelTime,
      totalDistance,
      activities
    };
  }

  /**
   * Generate day activities including meals and attractions
   */
  private generateDayActivities(
    attractions: ProcessedAttraction[],
    totalTravelTime: number
  ): Array<{
    id: string;
    time: string;
    title: string;
    description: string;
    location: string;
    duration: string;
    cost: string;
    type: string;
    coordinates: { lat: number; lng: number };
    startTime?: Date;
    endTime?: Date;
  }> {
    const activities = [];
    let currentTime = 8 * 60; // Start at 8:00 AM
    
    // Breakfast
    activities.push({
      id: `breakfast_${Date.now()}`,
      time: this.formatTime(currentTime),
      title: "Local Breakfast",
      description: "Start your day with a traditional local breakfast",
      location: "Local Restaurant",
      duration: "1 hr",
      cost: "$15",
      type: "meal",
      coordinates: { lat: 0, lng: 0 }
    });
    
    currentTime += 60; // 1 hour for breakfast
    
    // Add attractions with travel time
    attractions.forEach((attraction, index) => {
      activities.push({
        id: attraction.id,
        time: this.formatTime(currentTime),
        title: attraction.name,
        description: `Visit ${attraction.name} - ${attraction.themes.join(', ')}`,
        location: attraction.name,
        duration: `${Math.floor(attraction.duration / 60)} hr ${attraction.duration % 60} min`,
        cost: "$25",
        type: "attraction",
        coordinates: attraction.coordinates
      });
      
      currentTime += attraction.duration;
      
      // Add lunch after 2nd attraction or at 1 PM
      if (index === 1 || (index === 0 && currentTime >= 13 * 60)) {
        activities.push({
          id: `lunch_${Date.now()}`,
          time: this.formatTime(Math.max(currentTime, 13 * 60)),
          title: "Local Lunch",
          description: "Enjoy authentic local cuisine",
          location: "Local Restaurant",
          duration: "1.5 hrs",
          cost: "$30",
          type: "meal",
          coordinates: { lat: 0, lng: 0 }
        });
        currentTime = Math.max(currentTime, 13 * 60) + 90; // 1.5 hours for lunch
      }
      
      // Add travel time if not the last attraction
      if (index < attractions.length - 1) {
        currentTime += Math.ceil(totalTravelTime / (attractions.length - 1)) / 60;
      }
    });
    
    // Dinner
    activities.push({
      id: `dinner_${Date.now()}`,
      time: this.formatTime(Math.max(currentTime, 19 * 60)),
      title: "Evening Dining",
      description: "End your day with a delightful dinner experience",
      location: "Local Restaurant",
      duration: "2 hrs",
      cost: "$45",
      type: "meal",
      coordinates: { lat: 0, lng: 0 }
    });
    
    return activities;
  }

  /**
   * Generate time schedule for attractions in a day
   */
  generateTimeSchedule(
    optimizedDay: OptimizedDay,
    startTime: string = '09:00'
  ): Array<{
    attraction: ProcessedAttraction;
    startTime: string;
    endTime: string;
    travelTimeToNext?: number;
  }> {
    const schedule = [];
    let currentTime = this.parseTime(startTime);

    for (let i = 0; i < optimizedDay.attractions.length; i++) {
      const attraction = optimizedDay.attractions[i];
      const startTimeStr = this.formatTime(currentTime);
      
      // Add attraction duration
      currentTime += attraction.duration;
      const endTimeStr = this.formatTime(currentTime);

      const scheduleItem: ScheduleItem = {
        attraction,
        startTime: startTimeStr,
        endTime: endTimeStr
      };

      // Add travel time to next attraction (if not the last one)
      if (i < optimizedDay.attractions.length - 1) {
        const travelTime = Math.ceil(optimizedDay.totalTravelTime / (optimizedDay.attractions.length - 1));
        scheduleItem.travelTimeToNext = travelTime;
        currentTime += travelTime / 60; // Convert seconds to minutes
      }

      schedule.push(scheduleItem);
    }

    return schedule;
  }

  /**
   * Parse time string (HH:MM) to minutes since midnight
   */
  private parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Format minutes since midnight to time string (HH:MM)
   */
  private formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = Math.floor(minutes % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}

export const attractionOptimizer = new AttractionOptimizer();