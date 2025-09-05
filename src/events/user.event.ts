import { EventEmitter } from "events";

export enum UserEvents {
  UserRegistered = "user.registered",
}

class UserEventEmitter extends EventEmitter {}

export const userEvents = new UserEventEmitter();