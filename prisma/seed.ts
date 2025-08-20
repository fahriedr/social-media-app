import {
  randEmail,
  randFullName,
  randLines,
  randParagraph,
  randPassword, randPhrase,
  randTextRange,
  randUserName,
  randWord
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
    password: randPassword(),
    avatar: 'https://api.realworld.io/images/demo-avatar.png',
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