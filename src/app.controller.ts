import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('ads.txt')
  getAdsTxt(@Res() res: Response) {
    const adsFilePath = path.join(process.cwd(), 'Ads.txt');
    if (fs.existsSync(adsFilePath)) {
      const content = fs.readFileSync(adsFilePath, 'utf8');
      res.type('text/plain').send(content);
    } else {
      res.status(404).send('Ads.txt not found');
    }
  }
}
