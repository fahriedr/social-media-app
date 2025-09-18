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

  const imageList = [
    "https://thumbs.dreamstime.com/b/idyllic-summer-landscape-clear-mountain-lake-alps-45054687.jpg",
    "https://thumbs.dreamstime.com/b/spring-summer-landscape-blue-sky-clouds-river-boat-green-trees-narew-countryside-grass-poland-water-leaves-58070004.jpg",
    "https://thumbs.dreamstime.com/b/landscape-sunset-view-morain-lake-mountain-range-alberta-canada-44613434.jpg"
  ]

  const mediaLength = Math.floor(Math.random() * imageList.length) + 1;

  const media = Array.from({ length: mediaLength }, () => {
    const randomIndex = Math.floor(Math.random() * imageList.length);
    return imageList[randomIndex];
  });

  createPost(id, {
    caption: randPhrase(),
    media
  })
}

const main = async () => {
  try {
    const users = await Promise.all(Array.from({ length: 5 }, () => generateUser()));
    // users?.map(user => user);
    // for await (const user of users) {
    //   const posts = await Promise.all(Array.from({ length: 5 }, () => generatePost(user.id)));
    // }
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