import {
  randEmail,
  randFullName,
  randPhrase,
  randUserName,
} from '@ngneat/falso';
import { PrismaClient } from "@prisma/client";
import { createUser } from "../src/services/auth.service";
import { createPost } from '../src/services/post.service';
import { RegisteredUser } from '../src/models/registered-user.model';


const prisma = new PrismaClient();

export const generateUser = async (): Promise<RegisteredUser> => {

  return createUser({
    username: randUserName(),
    email: randEmail(),
    password: "password123",
    avatar: 'https://www.shutterstock.com/image-vector/avatar-photo-default-user-icon-600nw-2345549599.jpg',
    name: randFullName()
  });
}

export const generatePost = async (id: number) => {
  createPost(id, {
    caption: randPhrase(),
    media: ["https://i.pinimg.com/736x/de/70/e4/de70e47188c2922080f7b707cf732035.jpg"]
  })
}

const main = async () => {
  try {
    const users = await Promise.all(Array.from({ length: 12 }, () => generateUser()));
    users?.map(user => user);
    for await (const user of users) {
      const posts = await Promise.all(Array.from({ length: 12 }, () => generatePost(user.id)));
    }
  } catch (e) {
    console.error(e);

  }
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async () => {
    await prisma.$disconnect();
    process.exit(1);
  });