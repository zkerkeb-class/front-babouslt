import { MAIL_API_URL } from '@env';

export const sendMail = async (to: string) => {
  console.log(to);
  console.log(JSON.stringify({ to }));
  const response = await fetch(`${MAIL_API_URL}/mail/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ to }),
  });
  return response.json();
};
