import { PrismaClient } from '@prisma/client';
class UserRepo {
  constructor() {
    this.prisma = new PrismaClient();
  }
  //get all users
  async findAll() {
    return this.prisma.user.findMany();
  }


  async findById(id) {
    return this.prisma.user.findUnique({
      where: { id: Number(id) },
      include: {
        admin: true,
        instructor: true,
        student: true
      }
    });
  }

  async create(userData) {
    return this.prisma.user.create({
      data: userData
    });
  }

  async update(id, userData) {
    return this.prisma.user.update({
      where: { id: Number(id) },
      data: userData
    });
  }

  async delete(id) {
    return this.prisma.user.delete({
      where: { id: Number(id) }
    });
  }

  async findByUsernameAndPassword(username, password) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        student: true,
        instructor: true,
        admins: true,
      },
    });

    if (user && user.password === password) {
      return user;
    }

    return null;
  }

}

export default UserRepo;