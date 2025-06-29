import * as fs from 'fs';
import * as path from 'path';

export class SampleStoriesService {
  private static sampleStories: any[] | null = null;

  static loadSampleStories() {
    if (!this.sampleStories) {
      // Adjust path to work in both dev and production
      const basePath = process.env.NODE_ENV === 'production' ? path.resolve(process.cwd(), 'dist', 'scripts') : path.resolve(process.cwd(), 'src', 'scripts');
      const filePath = path.join(basePath, 'sample-stories.json');
      const data = fs.readFileSync(filePath, 'utf-8');
      this.sampleStories = JSON.parse(data);
    }
    return this.sampleStories || [];
  }

  static getStoryById(id: string) {
    const stories = this.loadSampleStories();
    return stories.find(story => story._id === id);
  }

  static getStoriesByIds(ids: string[]) {
    const stories = this.loadSampleStories();
    return stories.filter(story => ids.includes(story._id));
  }
}
