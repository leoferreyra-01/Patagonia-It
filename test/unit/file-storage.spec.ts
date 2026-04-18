import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { FileStorage } from '../../src/infrastructure/persistence/file-storage';

describe('FileStorage', () => {
  let tempDir: string;
  let storage: FileStorage;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'patagonia-it-'));
    process.env.DATA_DIR = tempDir;
    storage = new FileStorage();
  });

  afterEach(async () => {
    delete process.env.DATA_DIR;
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('returns empty array when file does not exist', async () => {
    const result = await storage.readArray('missing.json');
    expect(result).toEqual([]);
  });

  it('throws TypeError when file content is not an array', async () => {
    await fs.writeFile(
      path.join(tempDir, 'invalid.json'),
      JSON.stringify({ value: 'not-array' }),
      'utf-8',
    );

    await expect(storage.readArray('invalid.json')).rejects.toThrow(TypeError);
  });

  it('writes and reads arrays using atomic temp-file rename', async () => {
    const payload = [{ id: 1 }, { id: 2 }];

    await storage.writeArray('list.json', payload);

    const readPayload = await storage.readArray<{ id: number }>('list.json');
    expect(readPayload).toEqual(payload);

    const tmpPath = path.join(tempDir, 'list.json.tmp');
    await expect(fs.access(tmpPath)).rejects.toBeDefined();
  });
});
