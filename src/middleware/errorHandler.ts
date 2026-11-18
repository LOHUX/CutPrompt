// Development error handler middleware
import fs from 'fs';
import path from 'path';

export const errorHandler = (req: Request, res: Response, next: NextFunction) => {
  const url = req.url;
  
  // Handle custom error pages in development
  if (url === '/404' || url === '/404.html') {
    const filePath = path.join(__dirname, '../../public/404.html');
    if (fs.existsSync(filePath)) {
      res.status(404).sendFile(filePath);
      return;
    }
  }
  
  if (url === '/500' || url === '/500.html') {
    const filePath = path.join(__dirname, '../../public/500.html');
    if (fs.existsSync(filePath)) {
      res.status(500).sendFile(filePath);
      return;
    }
  }
  
  if (url === '/503' || url === '/503.html') {
    const filePath = path.join(__dirname, '../../public/503.html');
    if (fs.existsSync(filePath)) {
      res.status(503).sendFile(filePath);
      return;
    }
  }
  
  // For any other route that doesn't exist, show 404 page
  if (url !== '/' && !url.startsWith('/src/') && !url.startsWith('/@')) {
    const filePath = path.join(__dirname, '../../public/404.html');
    if (fs.existsSync(filePath)) {
      res.status(404).sendFile(filePath);
      return;
    }
  }
  
  next();
};

// Type definitions for Express-like objects
interface Request {
  url: string;
}

interface Response {
  status: (code: number) => Response;
  sendFile: (path: string) => void;
}

interface NextFunction {
  (): void;
}