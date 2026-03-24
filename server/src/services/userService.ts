import path from 'path';
import { FileService } from './fileService';
import { User } from '../shared/types/user';

const USERS_FILE = path.join(__dirname, '../../data/users.json');

class UserService extends FileService<User> {
  constructor() {
    super(USERS_FILE);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const users = await this.read();
    return users.find(user => user.email === email);
  }
}

export const userService = new UserService();