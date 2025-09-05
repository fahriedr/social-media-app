import { userEvents, UserEvents } from "../events/user.event";

userEvents.on(UserEvents.UserRegistered, async (user) => {
  // Here you’d integrate with nodemailer, SendGrid, etc.
  console.log(user, "ini dari listener");
});

// Example fake function for demonstration
async function fakeSendEmail(to: string, message: string) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Email sent to ${to}: ${message}`);
      resolve(true);
    }, 500);
  });
}