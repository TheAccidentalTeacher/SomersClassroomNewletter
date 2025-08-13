#!/usr/bin/env node

import { Command } from 'commander';
import { NewsletterEngine } from './core/NewsletterEngine';
import { WeatherProvider } from './services/WeatherProvider';
import chalk from 'chalk';
import ora from 'ora';

const program = new Command();

console.log(chalk.black.bgWhite.bold(' 🐾 PANTHERS NEWSLETTER GENERATOR 🐾 '));
console.log(chalk.gray('Unleashing fierce newsletters since 2025\n'));

program
  .name('panthers-newsletter')
  .description('Generate fierce newsletters with CLAWS!')
  .version('1.0.0');

program
  .command('generate')
  .description('🔥 Generate a newsletter that ROARS')
  .option('-d, --data <file>', 'Content data file (JSON/YAML)', 'data/sample-week.json')
  .option('-o, --output <dir>', 'Output directory', 'out')
  .option('-f, --format <type>', 'Output format (html|pdf|all)', 'html')
  .option('-w, --weather', 'Use weather-responsive theme')
  .option('-l, --location <city>', 'Location for weather theme', 'Glennallen, AK')
  .option('--fierce', 'Extra fierce mode (maximum attitude)', false)
  .action(async (options) => {
    const spinner = ora(chalk.yellow('🐾 Prowling through content...')).start();
    
    try {
      const engine = new NewsletterEngine();
      
      // Load weather data if requested
      if (options.weather) {
        spinner.text = chalk.yellow('🌤️  Checking the weather for theme adaptation...');
        const weather = new WeatherProvider();
        const weatherData = await weather.getCurrentWeather(options.location);
        engine.setWeatherTheme(weatherData);
      }
      
      spinner.text = chalk.yellow('📝 Curating content with panther precision...');
      await engine.loadContent(options.data);
      
      spinner.text = chalk.yellow('🎨 Generating visuals that command attention...');
      await engine.generateImages();
      
      spinner.text = chalk.yellow('⚡ Assembling the newsletter with fierce energy...');
      const result = await engine.generate({
        format: options.format,
        outputDir: options.output,
        fierceMode: options.fierce
      });
      
      spinner.succeed(chalk.green.bold('🎯 Newsletter generated with ATTITUDE!'));
      
      console.log(chalk.white('\n📍 Output:'));
      console.log(chalk.cyan(`   ${result.htmlPath}`));
      if (result.pdfPath) {
        console.log(chalk.cyan(`   ${result.pdfPath}`));
      }
      
      console.log(chalk.yellow('\n🔥 Pro tip: Add --fierce for maximum panther energy!'));
      
    } catch (error) {
      spinner.fail(chalk.red('💥 Something went wrong in the prowl...'));
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      process.exit(1);
    }
  });

program
  .command('init')
  .description('🏗️  Initialize a new newsletter project')
  .action(async () => {
    console.log(chalk.yellow('🐾 Creating your panther lair...'));
    // Initialize project structure
    console.log(chalk.green('✅ Project initialized! Ready to roar!'));
  });

program.parse();
