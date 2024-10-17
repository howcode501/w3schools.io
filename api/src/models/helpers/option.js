// eslint-disable-next-line no-unused-vars
module.exports = async (models, _config, _logger) => {
  const {
    RoleOption, VariantOption, RoleOptionValue, VariantOptionValue,
  } = models;

  async function option_update({
    name, value, role_id, variant_id,
  }) {
    const soa = async (model, where) => {
      const rec = await model.findFirst({ where });
      if (rec) {
        await model.update({ where: { id: rec.id }, data: { value } });
      } else {
        await model.create({ data: { value, ...where } });
      }
    };

    if (role_id) {
      const option = await RoleOption.findUnique({ where: { name } });
      if (option) {
        await soa(RoleOptionValue, value, { role_id, option_id: option.id });
      }
    }
    if (variant_id) {
      const option = await VariantOption.findUnique({ where: { name } });
      if (option) {
        await soa(VariantOptionValue, value, {
          variant_id,
          option_id: option.id,
        });
      }
    }
  }

  return {
    option_update,
  };
};
