import axios from 'axios';
import { WeatherData } from '../types';

export class WeatherProvider {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY;
  }

  async getCurrentWeather(location: string): Promise<WeatherData> {
    if (!this.apiKey) {
      console.warn('🌤️  No weather API key found, using default sunny panther mood');
      return this.getDefaultWeather();
    }

    try {
      // Using OpenWeatherMap API
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${this.apiKey}&units=imperial`
      );

      const weather = response.data;
      const condition = this.mapWeatherCondition(weather.weather[0].main);

      return {
        condition,
        temperature: Math.round(weather.main.temp),
        description: weather.weather[0].description
      };
    } catch (error) {
      console.warn('🌤️  Weather API failed, using default conditions');
      return this.getDefaultWeather();
    }
  }

  private mapWeatherCondition(condition: string): 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy' {
    const conditionMap: { [key: string]: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy' } = {
      'Clear': 'sunny',
      'Clouds': 'cloudy',
      'Rain': 'rainy',
      'Drizzle': 'rainy',
      'Snow': 'snowy',
      'Thunderstorm': 'stormy',
      'Mist': 'cloudy',
      'Fog': 'cloudy'
    };

    return conditionMap[condition] || 'cloudy';
  }

  private getDefaultWeather(): WeatherData {
    return {
      condition: 'sunny',
      temperature: 70,
      description: 'Perfect panther prowling weather'
    };
  }

  getPantherWeatherMessage(weather: WeatherData): string {
    const messages = {
      'sunny': '☀️ Perfect day for panther pride to shine!',
      'cloudy': '☁️ Even clouds can\'t dim our fierce spirit!',
      'rainy': '🌧️ Panthers thrive in any storm!',
      'snowy': '❄️ Cool weather, hot achievements!',
      'stormy': '⛈️ Stormy skies match our fierce energy!'
    };

    return messages[weather.condition];
  }
}
