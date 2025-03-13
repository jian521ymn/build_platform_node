const isProd = !process.argv.includes("--dev");
const getHost = (prodUrl) => {
  return isProd ? "localhost" : prodUrl; //远程MySQL数据库的ip地址
};
module.exports = {
  build_platform: {
    connectionLimit: 500,
    host: getHost("47.94.11.121"),
    user: "build_platform",
    password: "AhAtcEyyjSeSijWE",
    database: "build_platform",
  },
  jianymn_admin: {
    connectionLimit: 500,
    host: getHost("47.94.11.121"),
    user: "jianymn_admin",
    password: "AhAtcEyyjSeSijWE",
    database: "jianymn_admin",
  },
  event_registration: {
    connectionLimit: 500,
    host: getHost("47.94.11.121"),
    user: "event_registration",
    password: "4X3BDwyRhL7kDXDE",
    database: "event_registration",
  },
};
