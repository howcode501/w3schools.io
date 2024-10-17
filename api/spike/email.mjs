// eslint-disable-next-line no-unused-vars
import Ctx from '../src/ctx.js';

(async () => {
  const { send_password_reset } = await Ctx();

  send_password_reset({
    email: "balkishannatani@gmail.com",
    firstName: "BK",
    resetLink: "http://goto.link"
  });
})();
