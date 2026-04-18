import { promises as fs } from 'node:fs';
import path from 'node:path';

export class FileStorage {
  async readArray<T>(filePath: string): Promise<T[]> {
    const fullPath = this.resolvePath(filePath);

    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      const parsed = JSON.parse(content) as unknown;
      if (!Array.isArray(parsed)) {
        throw new TypeError(`Expected array in ${filePath}`);
      }
      return parsed as T[];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  async writeArray<T>(filePath: string, data: T[]): Promise<void> {
    const fullPath = this.resolvePath(filePath);
    const directory = path.dirname(fullPath);

    await fs.mkdir(directory, { recursive: true });

    const tmpFilePath = `${fullPath}.tmp`;
    await fs.writeFile(tmpFilePath, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tmpFilePath, fullPath);
  }

  private resolvePath(filePath: string): string {
    return path.join(process.cwd(), filePath);
  }
}
