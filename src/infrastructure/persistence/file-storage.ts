import { promises as fs } from 'node:fs';
import path from 'node:path';
import { PersistenceError } from '../errors/persistence.error';

export class FileStorage {
  async readArray<T>(filePath: string): Promise<T[]> {
    const fullPath = this.resolvePath(filePath);

    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      const parsed = JSON.parse(content) as unknown;
      if (!Array.isArray(parsed)) {
        throw PersistenceError.invalidData(filePath);
      }
      return parsed as T[];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }

      if (error instanceof PersistenceError) {
        throw error;
      }

      if (error instanceof SyntaxError) {
        throw PersistenceError.invalidData(filePath, error);
      }

      throw PersistenceError.read(filePath, error);
    }
  }

  async writeArray<T>(filePath: string, data: T[]): Promise<void> {
    const fullPath = this.resolvePath(filePath);
    const directory = path.dirname(fullPath);

    try {
      await fs.mkdir(directory, { recursive: true });

      const tmpFilePath = `${fullPath}.tmp`;
      await fs.writeFile(tmpFilePath, JSON.stringify(data, null, 2), 'utf-8');
      await fs.rename(tmpFilePath, fullPath);
    } catch (error) {
      throw PersistenceError.write(filePath, error);
    }
  }

  private resolvePath(filePath: string): string {
    const dataDir = process.env.DATA_DIR ?? 'data';
    const absoluteBase = path.isAbsolute(dataDir)
      ? dataDir
      : path.join(process.cwd(), dataDir);
    return path.join(absoluteBase, filePath);
  }
}
