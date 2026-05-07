import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User.entity';

export const UserRepository = AppDataSource.getRepository(User).extend({
  findByEmail(email: string): Promise<User | null> {
    return this.findOneBy({ email });
  },
});
