// utils/custom-id.js
const getCustomId = async (Model) => {
  // dynamically import nanoid
  const { customAlphabet } = await import("nanoid");

  let status = true;
  let id;
  while (status) {
    const nanoid = customAlphabet(
      process.env.ID_ALPHABET || "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      11
    );
    id = `${Model.modelName}_${nanoid()}`;
    let doc = await Model.findOne({ id });
    if (!doc) status = false;
  }
  return id;
};

module.exports = { getCustomId };
