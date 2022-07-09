const createPayloadJwt = (user) => {
  return {
    _id: user._id,
    nama: user.nama,
    email: user.email,
    role: user.role,
  };
};

module.exports = createPayloadJwt;
