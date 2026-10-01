import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  // Додаємо обов'язковий атрибут nickname
  userAttributes: {
    nickname: {
      mutable: true,
      required: true,
    },
  },
});