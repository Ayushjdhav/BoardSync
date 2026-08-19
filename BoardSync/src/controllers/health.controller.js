/**
 * Health check controller
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getHealth = (req, res) => {
  res.status(200).json({ status: "ok" });
};
