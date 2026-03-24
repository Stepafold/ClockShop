import fs from 'fs/promises';
import path from 'path';

export class FileService<T> {
  constructor(private filePath: string) {}

  async read(): Promise<T[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        await this.write([]);
        return [];
      }
      throw error;
    }
  }

  async write(data: T[]): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }

  async findById(id: string): Promise<T | undefined> {
    const data = await this.read();
    return data.find((item: any) => item.id === id);
  }

  async create(item: T): Promise<T> {
    const data = await this.read();
    data.push(item);
    await this.write(data);
    return item;
  }

  async update(id: string, updates: Partial<T>): Promise<T | undefined> {
    const data = await this.read();
    const index = data.findIndex((item: any) => item.id === id);
    if (index === -1) return undefined;
    
    data[index] = { ...data[index], ...updates };
    await this.write(data);
    return data[index];
  }

  async delete(id: string): Promise<boolean> {
    const data = await this.read();
    const filtered = data.filter((item: any) => item.id !== id);
    if (filtered.length === data.length) return false;
    await this.write(filtered);
    return true;
  }
}